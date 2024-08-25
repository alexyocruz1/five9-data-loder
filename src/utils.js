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

/**
 * Transforms the users info response into an array of objects.
 * @param {Object} response - The response object containing users info.
 * @returns {Array} - An array of user info objects.
 */
export const transformUsersGeneralResponse = (response) => {
  const { data } = response;
  return data?.return || [];
};

/**
 * Transforms the users info response into an array of objects with generalInfo and skills.
 * @param {Object} response - The response object containing users info.
 * @returns {Array} - An array of user info objects with skills.
 */
export const transformUsersWithSkillsResponse = (response) => {
  const { data } = response;
  const users = data?.return || [];

  const transformedUsers = [];

  users.forEach(user => {
    const { generalInfo, skills } = user;
    if (skills && skills.length > 0) {
      skills.forEach(skill => {
        const transformedSkill = {};
        Object.keys(skill).forEach(key => {
          if (!key.toLowerCase().includes('skill')) {
            transformedSkill[`skill${key.charAt(0).toUpperCase() + key.slice(1)}`] = skill[key];
          } else {
            transformedSkill[key] = skill[key];
          }
        });
        transformedUsers.push({
          ...generalInfo,
          ...transformedSkill,
        });
      });
    }
  });

  return transformedUsers;
};