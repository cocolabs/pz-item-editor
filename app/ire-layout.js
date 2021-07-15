let $ = require('jquery')
let events = require('events')

class IRE_Layout {

  constructor() {
    this.events = new events.EventEmitter()

    this.workspacePathInput = $('#workspace-path-browser')
    this.workspaceFileBrowser = $('.file-browser .files')
    this.workspaceItemsBrowser = $('.items-browser .items')
    this.workspaceCreateNewFileButton = $('#createNewFile')

    this.setEvents()
  }

  setEvents() {
    this.workspacePathInput.on('change', () => {
      let newPath = this.workspacePathInput.val()
      this.events.emit('WorkspacePathChanged', newPath)
    })
    this.workspaceCreateNewFileButton.on('click', () => this.events.emit('CreateNewFileClicked'))
  }

  updateWorkspacePathInput(newValue) {
    this.workspacePathInput.val(newValue)
  }

  clearFileBrowser() {
    this.workspaceFileBrowser.empty()
  }

  clearEditorBrowser() {
    this.workspaceItemsBrowser.empty()
  }

  addFileToFileBrowser(fileName) {
    var newFile = $("<div class='file'>" + fileName + "</div>")
    this.workspaceFileBrowser.append(newFile)

    newFile.on('click', () => {
      if ($(newFile).hasClass("active")) return
      this.workspaceFileBrowser.find(".file").removeClass('active')
      $(newFile).addClass('active')
      this.events.emit('FileClicked', fileName)
    })
  }

  addItemToEditorBrowser(type, name, icon) {
    var newItem = (icon) ? $("<div class='item'><img src='" + icon + "' />" + name + "</div>") : $("<div class='item'>" + "<b>" + type + "</b><br>" + name + "</div>")
    this.workspaceItemsBrowser.append(newItem)
    var index = this.workspaceItemsBrowser.length - 1

    newItem.on('click', () => {
      if (type === "module") this.events.emit('ModuleClicked')
      if (type === "imports") this.events.emit('ImportsClicked')
      if (type === "item") this.events.emit('ItemClicked', index)
      if (type === "recipe") this.events.emit('RecipeClicked', index)
    })
  }

}

module.exports = IRE_Layout