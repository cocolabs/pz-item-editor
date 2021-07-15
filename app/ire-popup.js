let $ = require('jquery')
let events = require('events')

class IRE_Popup {

  constructor() {
    this.element = $(".popup")
    this.events = new events.EventEmitter()

    this.element.find(".controls .ok").on('click', () => this.ok())
    this.element.find(".controls .cancel").on('click', () => this.cancel())
  }

  setValue(value) {
    this.element.find("input").val(value)
  }

  value() {
    return this.element.find("input").val()
  }

  open(title, okText = "Ok", cancelText) {
    setTimeout(() => {
      $(".popup-overlay, .popup").addClass('active')
      this.element.find("h1").html(title)
      this.element.find(".controls .ok").html(okText)
      this.element.find(".controls .cancel").html(cancelText)
      this.element.find(".controls .cancel").removeClass("hidden")
      if (!cancelText) this.element.find(".controls .cancel").addClass("hidden")
      this.element.find("input").addClass("disabled")

      this.events.emit('open')
    }, 0)
  }

  prompt(title, okText = "Ok", cancelText = "Cancel", inputValue = "") {
    setTimeout(() => {
      $(".popup-overlay, .popup").addClass('active')
      this.element.find("h1").html(title)
      this.element.find(".controls .ok").html(okText)
      this.element.find(".controls .cancel").html(cancelText)
      this.element.find(".controls .cancel").removeClass("hidden")
      if (!cancelText) this.element.find(".controls .cancel").addClass("hidden")
      this.element.find("input").val(inputValue)
      this.element.find("input").focus()
      this.element.find("input").removeClass("disabled")

      this.events.emit('open')
    }, 0)
  }

  close() {
      $(".popup-overlay, .popup").removeClass('active')
      this.events.emit('close')
      this.events.removeAllListeners()
  }

  ok() {
      this.events.emit('ok', this.value())
      this.close()
  }

  cancel() {
      this.events.emit('cancel')
      this.close()
  }

}

module.exports = IRE_Popup