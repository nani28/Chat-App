const socket = io();

//Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $locationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  const $newMessage = $messages.lastElementChild;

  const newMessageStyle = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyle.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  const visibleHeight = $messages.offsetHeight

  const containerHeight = $messages.scrollHeight

  const scrollOffset = $messages.scrollTop + visibleHeight

  if(containerHeight - newMessageHeight <= scrollOffset){
    $messages.scrollTop=$messages.scrollHeight
  }
};
socket.on("message", ({ username, message, createdAt }) => {
  const html = Mustache.render(messageTemplate, {
    username,
    message,
    createdAt: moment(createdAt).format("hh:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("gotLocation", ({ username, url, createdAt }) => {
  const html = Mustache.render(locationTemplate, {
    username,
    url,
    createdAt: moment(createdAt).format("hh:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("roomdata", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  $messageFormButton.setAttribute("disabled", "disabled");
  const textValue = e.target.elements.message.value;
  socket.emit("exchangeMsg", textValue, (error) => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }
  });
});

$locationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser!");
  }
  $locationButton.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        lat: position.coords.latitude,
        log: position.coords.longitude,
      },
      (ack) => {
        $locationButton.removeAttribute("disabled");
        console.log(ack);
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
