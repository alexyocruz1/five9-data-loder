/**
 * Transforms the response with fields and values into an array of objects.
 * @param {Object} response - The response object containing fields and records.
 * @returns {Array} - An array of objects with field names as keys and corresponding values.
 */
export const transformResponse = (response) => {
    const { data } = response;
    const { fields, records } = data.return;
    return records.map(record => {
      const transformedRecord = {};
      fields.forEach((field, index) => {
        transformedRecord[field] = record.values.data[index];
      });
      return transformedRecord || [];
    });
  };