import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

declare var easyrtc: any

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  selfEasyrtcid = "Obtaining ID...";
  occupants = {};
  roomName = {}
  isPrimary = {};
  
  constructor(public navCtrl: NavController) {

  }

  ionViewDidLoad() {
    easyrtc.setSocketUrl("https://webrtc.pacecouriers.com");
    this.connect();
  }

  addToConversation(who, msgType, content) {
    // Escape html special characters, then add linefeeds.
    content = content.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    content = content.replace(/\n/g, "<br />");
    document.getElementById("conversation").innerHTML +=
    "<b>" + who + ":</b>&nbsp;" + content + "<br />";
  }
 
 
  connect() {
    easyrtc.setPeerListener(this.addToConversation);
    easyrtc.setRoomOccupantListener((roomName, occupants, isPrimary)=>{
      this.roomName = roomName;
      this.occupants = occupants;
      this.isPrimary = isPrimary;
    });
    easyrtc.connect("easyrtc.instantMessaging", (easyrtcid)=>{
      this.selfEasyrtcid = easyrtcid;      
    }, (errorCode, message)=>{
      easyrtc.showError(errorCode, message);
    });
  }
 
  getOccupants() {
    return Object.keys(this.occupants);
  }
 
  convertListToButtons (roomName, occupants, isPrimary) {

    console.log(roomName);
    console.log(occupants);
    console.log(isPrimary);

   

    var otherClientDiv = document.getElementById("otherClients");
    while (otherClientDiv.hasChildNodes()) {
      otherClientDiv.removeChild(otherClientDiv.lastChild);
    }
  
    for(var easyrtcid in occupants) {
      var button = document.createElement("button");
      button.onclick = function(easyrtcid) {
        return function() {
          this.sendStuffWS(easyrtcid);
        };
      }(easyrtcid);
      var label = document.createTextNode("Send to " + easyrtc.idToName(easyrtcid));
      button.appendChild(label);
  
      otherClientDiv.appendChild(button);
    }
    if( !otherClientDiv.hasChildNodes() ) {
      otherClientDiv.innerHTML = "<em>Nobody else logged in to talk to...</em>";
    }
  }
  
  
  sendStuffWS(otherEasyrtcid) {
    var text = document.getElementById("sendMessageText")['value'];
    if(text.replace(/\s/g, "").length === 0) { // Don"t send just whitespace
      return;
    }
  
    easyrtc.sendDataWS(otherEasyrtcid, "message",  text);
    this.addToConversation("Me", "message", text);
    document.getElementById("sendMessageText")['value'] = "";
  }

}
