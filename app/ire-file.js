let fs = require('fs')
let path = require('path')
let events = require('events')

class IRE_File {

  constructor(workspace, fileName) {
    this.events = new events.EventEmitter()

    this.module = ""
    this.imports = "{}"
    this.items = []
    this.recipes = []

    // Lets store a copy of the initial values to know if it has changed and need to be saved
    // once we save we reset the initial value to the new one to see the future changes
    this.initialModule = ""
    this.initialImports = ""
    this.InitialItems = []
    this.InitialRecipes = []

    this.workspace = workspace
    this.fileName = fileName
    this.path = path.join(workspace, fileName)

    this.reload()
  }

  save() {
    this.events.emit('Saved')
  }

  reload() {
    this.data = null
    this.buffer = null
    this.text = null
    this.valid = false

    fs.readFile(this.path, {}, (error, buffer) => {
      if (error) return console.log(error)

      this.buffer = buffer
      try {
        this.text = buffer.toString()
        this.processFile()
        this.events.emit('Loaded')
      }
      catch(error) {
        console.log("Error loading file", this.fileNam)
        console.log(error)
        this.events.emit('Error', error)
      }
    })
  }
  
  processFile() {
    let formatted = this.text.replace(/(\r\n|\t|\n|\r)/gm, ' ') // remove tab & new line
    formatted = formatted.replace(/ +(?= )/g, '') // remove multiple spaces
    formatted = formatted.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').trim() // strip comments

    this.module = formatted.split(" ")[1] // get the module name
    this.imports = ""
    this.items = {}
    this.recipes = {}

    let level0 = formatted.substring(formatted.indexOf("{") + 1, formatted.lastIndexOf("}")).trim() // get the first level of {}
    let level1 = [] // we store each item/recipe level here

    while (level0.includes("}")) {
      let part = level0.substring(0, level0.indexOf("}") + 1) // lets get the first item/recipe we can
      level1.push({ full: part.trim() }) // add it to our level1
      level0 = level0.replace(part, "") // remove from level0
    }

    // let's loop this level
    level1.forEach(level => {
      level.content = level.full.substring(level.full.indexOf("{"), level.full.lastIndexOf("}") + 1).trim()
      level.type = level.full.replace(level.content, "").trim().split(" ")[0]
      level.title = level.full.replace(level.content, "").trim().replace(level.type, "").trim()

      // let's finish by cleaning the content
      level.content = level.content.replace("{", "").replace("}", "").split(",")
      for (let [i, v] of level.content.entries()) {
        if (v.length > 0) level.content[i] = v.trim() // trim each content entry
        if (level.content[i].length === 0) level.content.splice(i, 1) // remove empty line
      }

      if (level.type === "imports") this.imports = level.content
      if (level.type === "item") this.items[level.title] = level.content
      if (level.type === "recipe") this.recipes[level.title] = level.content
    })

    this.reorderItems()
    this.reorderRecipes()

    this.valid = true
    this.events.emit('Processed')
  }

  reorderItems() {
    let sortable = Object.keys(this.items)
    sortable.sort((a, b) => {
      return ('' + a).localeCompare(b)
    })
    let newList = {}
    sortable.forEach(key => {
      newList[key] = this.items[key]
    })
    this.items = newList
  }

  reorderRecipes() {
    let sortable = Object.keys(this.recipes)
    sortable.sort((a, b) => {
      return ('' + a).localeCompare(b)
    })
    let newList = {}
    sortable.forEach(key => {
      newList[key] = this.recipes[key]
    })
    this.recipes = newList
  }

  getItemProperty(itemName, propertyName) {
    let value = null
    this.items[itemName].forEach(line => {
      if (line.substring(0, line.indexOf("=")).trim() === propertyName) {
        return value = line.split("=")[1].trim()
      }
    })
    return value
  }

  getIconName(itemName) {
    return this.getItemProperty(itemName, "Icon")
  }

  updateModuleName(newModuleName) {
    this.module = newModuleName
  }

  updateImports(newImports) {
    this.imports = newImports
  }

  updateItem(index, newItem) {
    
  }

  updateRecipe(index, newRecipe) {

  }
}

module.exports = IRE_File