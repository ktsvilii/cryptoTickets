import ArrowDown from '../assets/angle-down-solid.svg';

const Sort = () => {
  return (
    <div className='sort'>
      <div className='sort__select'>
        <p>Select Your Genre</p>
        <img src={ArrowDown} alt='Dropdown' />
      </div>

      <div className='sort__select'>
        <p>Select Your Dates</p>
        <img src={ArrowDown} alt='Dropdown' />
      </div>

      <div className='sort__select'>
        <p>Select Your Distance</p>
        <img src={ArrowDown} alt='Dropdown' />
      </div>
    </div>
  );
};

export default Sort;
