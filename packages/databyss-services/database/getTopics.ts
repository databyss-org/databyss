import { db } from './db'

const getPouchTopicHeaders = async () => {
  const _response = await db.find({
    selector: {
      type: 'TOPIC',
    },
  })
}

export default getPouchTopicHeaders
