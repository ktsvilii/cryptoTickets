import { useCallback, useEffect, useState } from 'react';

import Seat from './Seat';

import close from '../assets/close.svg';

const SeatChart = ({ occasion, contract, provider, setToggle }) => {
  const [seatsTaken, setSeatsTaken] = useState([]);

  const getSeatsTaken = useCallback(async () => {
    const seatsTaken = await contract.getSeatsTaken(occasion.id);
    setSeatsTaken(seatsTaken);
  }, [occasion.id, contract]);

  const buyHandler = async _seat => {
    try {
      const signer = await provider.getSigner();
      const transaction = await contract.connect(signer).mint(occasion.id, _seat, { value: occasion.cost });

      await transaction.wait();
    } catch (error) {
      console.log(error);
    }

    await getSeatsTaken();
  };

  useEffect(() => {
    getSeatsTaken();
  }, [getSeatsTaken]);

  return (
    <div className='occasion'>
      <div className='occasion__seating'>
        <h1>{occasion.name} Seating Map</h1>

        <button onClick={() => setToggle(false)} className='occasion__close'>
          <img src={close} alt='Close' />
        </button>

        <div className='occasion__stage'>
          <strong>STAGE</strong>
        </div>

        {seatsTaken &&
          Array(25)
            .fill(1)
            .map((e, i) => (
              <Seat
                i={i}
                step={1}
                columnStart={0}
                maxColumns={5}
                rowStart={2}
                maxRows={5}
                seatsTaken={seatsTaken}
                buyHandler={buyHandler}
                key={i}
              />
            ))}

        <div className='occasion__spacer--1 '>
          <strong>WALKWAY</strong>
        </div>

        {seatsTaken &&
          Array(Number(occasion.maxTickets) - 50)
            .fill(1)
            .map((e, i) => (
              <Seat
                i={i}
                step={26}
                columnStart={6}
                maxColumns={15}
                rowStart={2}
                maxRows={15}
                seatsTaken={seatsTaken}
                buyHandler={buyHandler}
                key={i}
              />
            ))}

        <div className='occasion__spacer--2'>
          <strong>WALKWAY</strong>
        </div>

        {seatsTaken &&
          Array(25)
            .fill(1)
            .map((e, i) => (
              <Seat
                i={i}
                step={Number(occasion.maxTickets) - 24}
                columnStart={22}
                maxColumns={5}
                rowStart={2}
                maxRows={5}
                seatsTaken={seatsTaken}
                buyHandler={buyHandler}
                key={i}
              />
            ))}
      </div>
    </div>
  );
};

export default SeatChart;
