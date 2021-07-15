let fs = require('fs')
let path = require('path')

let IRE_File = require('./ire-file')
let IRE_Popup = require('./ire-popup')
let IRE_Layout = require('./ire-layout')

class IRE {

  constructor() {
    this.layoutManager = new IRE_Layout()
    this.popupManager = new IRE_Popup()

    this.previousWorkspacePath = ""
    this.currentWorkspacePath = ""
    this.workspaceFiles = {}
    this.currentFile = null

    // on WorkspacePathChanged
    this.layoutManager.events.on('WorkspacePathChanged', (workspacePath) => {
      this.previousWorkspacePath = this.currentWorkspacePath
      this.currentWorkspacePath = workspacePath
      this.loadWorkspacePath(workspacePath)
    })

    // on CreateNewFileClicked
    this.layoutManager.events.on('CreateNewFileClicked', () => {
      this.popupManager.prompt("New .txt file to create in this workspace", "Create", "Cancel", "new_file.txt")
      this.popupManager.events.on('ok', (newFileName) => this.createNewFile(newFileName))
    })

    // on FileClicked
    this.layoutManager.events.on('FileClicked', (fileName) => {
      console.log("Clicked file", fileName)
      this.currentFile = this.getFileByName(fileName)
      if (this.currentFile) this.loadCurrentFile()
    })

    this.layoutManager.events.on('ModuleClicked', () => {
      this.popupManager.prompt('Set module name', 'Save', 'Cancel', this.currentFile.module)
      this.popupManager.events.on('ok', (newModuleName) => {
        this.currentFile.updateModuleName(newModuleName)
        this.loadCurrentFile()
      })
    })

    this.layoutManager.events.on('ImportsClicked', () => {
      this.popupManager.prompt('Set imports', 'Save', 'Cancel', this.currentFile.imports)
      this.popupManager.events.on('ok', (newImports) => {
        this.currentFile.updateImports(newImports)
        this.loadCurrentFile()
      })
    })

    this.layoutManager.events.on('ItemClicked', (index) => {

    })

    this.layoutManager.events.on('RecipeClicked', (index) => {

    })

    // Load saved workspacepath at start
    let lastWorkspace = localStorage.getItem('currentWorkspacePath')
    if (lastWorkspace) this.loadWorkspacePath(lastWorkspace)
  }

  getFileByName(fileName) {
    let result = null
    for (let obj of Object.values(this.workspaceFiles)) {
      if (obj.fileName === fileName) {
        result = obj
        break
      }
    }
    return result
  }

  createNewFile(newFileName) {
    if (this.currentWorkspacePath && newFileName) {
      try {
        let newFilePath = path.join(this.currentWorkspacePath, "scripts", newFileName)

        if (fs.existsSync(newFilePath) == false) {
          fs.writeFileSync(newFilePath, "", { encoding: 'utf-8' })
          this.reloadWorkspace()
        }
        else this.popupManager.open("A file with this name already exist!", "Ok", "")
      }
      catch(error) {
        console.log(error)
      }
    }
  }

  reloadWorkspace() {
    this.loadWorkspacePath(this.currentWorkspacePath)
  }

  loadWorkspacePath(workspacePath) {
    this.currentWorkspacePath = workspacePath
    this.currentScriptsPath = path.join(workspacePath, "scripts")

    // keep only .txt files
    fs.readdir(this.currentScriptsPath, (error, files) => {
      if (error) {
        this.popupManager.open(error, 'Ok', '')
        this.currentWorkspacePath = this.previousWorkspacePath
        this.layoutManager.updateWorkspacePathInput(this.previousWorkspacePath)
        return
      }

      this.workspaceFiles = {}
      this.currentFile = null
      this.layoutManager.clearEditorBrowser()

      this.layoutManager.clearFileBrowser()
      files.forEach(fileName => {
        if (path.extname(fileName) === ".txt") {
          let newFile = new IRE_File(this.currentScriptsPath, fileName)
          newFile.events.on('Loaded', () => { console.log(fileName, 'has loaded!') })
          newFile.events.on('Processed', () => { console.log(fileName, 'has been proccessed!') })
          newFile.events.on('Error', (error) => { console.log(fileName, 'has error', error) })
          newFile.events.on('Saved', () => { console.log(fileName, 'has saved!') })

          this.workspaceFiles[fileName] = newFile
          this.layoutManager.addFileToFileBrowser(fileName)
        }
      })

      // Save current workspace
      localStorage.setItem('currentWorkspacePath', workspacePath)
      this.layoutManager.updateWorkspacePathInput(workspacePath)
    })
  }

  loadCurrentFile() {
    this.layoutManager.clearEditorBrowser()

    this.layoutManager.addItemToEditorBrowser('module', this.currentFile.module)
    this.layoutManager.addItemToEditorBrowser('imports', this.currentFile.imports)

    Object.keys(this.currentFile.items).forEach(key => {
      let icon = this.currentFile.getIconName(key)
      let iconPath = (icon) ? path.join(this.currentWorkspacePath, "textures", "Item_" + icon) + ".png" : ""
      this.layoutManager.addItemToEditorBrowser('item', key, iconPath)
    })

    Object.keys(this.currentFile.recipes).forEach(key => {
      this.layoutManager.addItemToEditorBrowser('recipes', key)
    })
  }

}

const instance = new IRE()
module.exports = instance
