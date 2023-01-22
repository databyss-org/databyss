import { cloudant } from '@databyss-org/data/cloudant'
import { Role } from '@databyss-org/data/interfaces'

// function checkRequiredRoles(requiredRoles: GroupRole[], userRoles: GroupRole) {
//   return requiredRoles.filter((value) => userRoles.includes(value)).length > 0
// }

/**
 * Checks that group with id req.params.id can be accessed by req.user.id
 *   with the given role(s)
 * Adds group to the request object
 * @returns status 401 if check fails
 * - must come after auth middleware
 */
export const groupMiddleware = (requiredRoles: Role[]) => async (
  req,
  res,
  next
) => {
  if (requiredRoles.length > 1 || requiredRoles[0] !== Role.Admin) {
    console.warn('groupMiddleware only checks for Role.Admin', requiredRoles)
    return next()
  }
  const groupId = req.params.id

  // Get group from groups db
  const _group = await cloudant.models.Groups.tryGet(groupId)
  if (!_group) {
    return res.status(404).json({ msg: `group not found with id ${groupId}` })
  }

  if (_group.belongsToUserId !== req.user.id) {
    return res.status(404).json({
      msg: `user ${req.user.id} not authorized to modify group ${groupId}`,
    })
  }

  req.group = _group

  return next()
}
