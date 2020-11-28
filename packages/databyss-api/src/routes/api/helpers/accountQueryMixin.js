export const getBlockAccountQueryMixin = (req) =>
  req.asAccount && req.publicPages?.[0]
    ? {
        _id: { $in: req.publicPages[0].blocks.map((b) => b._id) },
      }
    : {
        account: req.account?._id,
      }

export const getBlockRelationsAccountQueryMixin = (req) =>
  req.asAccount && req.publicPages?.[0]
    ? {
        block: { $in: req.publicPages[0].blocks.map((b) => b?._id) },
      }
    : {
        account: req.account?._id,
      }

export const getPageAccountQueryMixin = (req) =>
  req.asAccount && req.publicPages
    ? {
        _id: req.publicPages[0]?._id,
      }
    : {
        account: req.account?._id,
      }
