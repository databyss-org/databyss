import { getSelectedBlocks, hasSelection } from './slateUtils'
import hotKeys from './hotKeys'

export const clipboard = (event, editor, onPaste) => {
  //   console.log(event.key)
  //   console.log(editor.value.toJSON())
  const { value } = editor
  const { selection, fragment } = value

  if (hotKeys.isCopy(event) && hasSelection(value)) {
    const selectedBlocks = getSelectedBlocks(value)
    selectedBlocks.map(b => console.log(b))
    //   var data = new Blob(['Text data'], { type: 'text/plain' })
    // var data = new Blob([JSON.stringify(selection)], { type: 'text/plain' })
    // var item = new ClipboardItem({ 'text/plain': data })

    // navigator.clipboard.write([item]).then(
    //   function() {
    //     console.log('Copied to clipboard successfully!')
    //   },
    //   function(e) {
    //     console.log(e)
    //   }
    // )
  }

  if (hotKeys.isPaste(event)) {
    // convert new paste data to json

    console.log(editor.value.toJSON())

    //  onPaste(editor)

    //   const clipboardData = navigator.clipboard
    //   clipboardData.read().then(data => {
    //     data[0].getType('text/plain').then(blob => {
    //       console.log(blob)
    //       new Response(blob).text().then(t => console.log(t))
    //     })
    //   })
  }
}

// returns an object with {blocks, fragments}
// blocks returns full blocks
// fragments return edge blocks
// fragment {_id: blockID, text: {textValue, ranges}}
const getSelection = value => {}
