const validateData = async (data, schema) => {
  try {
    const options = {
      language: {
        key: '{{key}} ',
      },
    };
    return await schema.validate(data, options);
  } catch (error) { 
    return error;
  }
};

export default validateData;
