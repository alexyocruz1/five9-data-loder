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
 * Transforms the users general response into a flat array of objects.
 * @param {Object} response - The response object containing users data.
 * @returns {Array} - An array of flattened user objects.
 */
export const transformUsersInfoResponse = (response) => {
  const { data } = response;
  const users = data?.return || [];

  return users.map((user) => {
    const { generalInfo, roles = {}, skills = [] } = user;
    const flattenedRoles = Object.keys(roles).map((role) => ({
      role,
      permissions: roles[role].permissions.map((perm) => `${perm.type}: ${perm.value}`).join(', '),
    }));

    return {
      ...generalInfo,
      agentGroups: user.agentGroups?.join(', ') || '',
      cannedReports: user.cannedReports?.map((report) => report.name).join(', ') || '',
      roles: flattenedRoles.map((role) => `${role.role}: ${role.permissions}`).join('; ') || '',
      skills: skills.map((skill) => skill.skillName).join(', ') || '',
    };
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