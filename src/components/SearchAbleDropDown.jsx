import React from 'react';
import Select from 'react-select';

const SearchAbleDropDown = ({ options, onSelect, selectedValue }) => {

  return (
    <Select
      options={options}
      placeholder={selectedValue?selectedValue:"Select....."}
      isSearchable
      className='w-full dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
      onChange={(selectedOption) => onSelect(selectedOption.value)}
      getOptionLabel={(option) => option.label} // specify the label for display
      getOptionValue={(option) => option.value} // specify the value for comparison
      defaultValue={options.find((option) => option.value === selectedValue)}
    />
  );
};

export default SearchAbleDropDown;
