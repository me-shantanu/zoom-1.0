// this is a promise which is only possible in js navigator mediadevices
const socket = io("/");
const videoGrid = document.getElementById("video__grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

const scrollToBottom = () => {
  let d = $("main__chat__window");
  d.scrollTop(d.prop("scrollHeight"));
};
//mute our video
const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};
const setMuteButton = () => {
  const html = `
  <img src="/images/mic.png" alt="" />
  <span>Mute</span>
  `;
  document.querySelector(".main__mute__button").innerHTML = html;
};
const setUnmuteButton = () => {
  const html = ` 
  <img class="unmute" src="/images/micm.png" alt="" />
  <span>Unmute</span>
  `;
  document.querySelector(".main__mute__button").innerHTML = html;
};
//puse video
const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};
const setStopVideo = () => {
  const html = `
  <img src="/images/video.png" alt="" />
              <span>Stop Video</span>
  `;
  document.querySelector(".main__video__button").innerHTML = html;
};
const setPlayVideo = () => {
  const html = `
  <img src="/images/videos.png" alt="" />
              <span>Play Video</span>
  `;
  document.querySelector(".main__video__button").innerHTML = html;
};

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443",
});

let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUesr(userId, stream);
    });
    let text = $("input");

    $("html").keydown((e) => {
      if (e.which == 13 && text.val().length !== 0) {
        socket.emit("message", text.val());
        text.val("");
      }
    });
    socket.on("createMessage", (message) => {
      $(".messages").append(
        `<li class="message"><b>user</b><br/>${message}</li>`
      );
      scrollToBottom();
    });
  });

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

const connectToNewUesr = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};
