import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonChip, IonIcon, IonTextarea, IonLabel, IonNote, IonList, IonItem, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard, IonCardContent, IonToggle } from '@ionic/angular/standalone';
import { io } from 'socket.io-client';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonChip, IonIcon, IonTextarea, FormsModule, IonLabel, IonNote, IonList, IonItem, IonHeader, IonToolbar, IonTitle, IonToggle, IonContent, IonButton, IonCard, IonCardContent, CommonModule],
})

export class HomePage {
  constructor() {
  }

  //serverUrl = 'http://13.49.217.91:1884';   //for prod
  //serverUrl = 'http://localhost:1888';     //for test on browser
  //serverUrl = 'http://192.168.1.64:1888';    //for test on Android studio, ip of the computer running goTrackerMQTT
  serverUrl = 'http://10.3.9.46:1888';    //Office for test on Android studio, ip of the computer running goTrackerMQTT
  //to debug  http://192.168.1.64:1888/socket.io/socket.io.js
  socket: any;
  connected = false;
  messages: string[] = [];
  token: any = "";
  pushNotificationsEnabled = false;
  messageList: string = '';

  ngOnInit() {
    console.log('Initializing HomePage');
    //this.connectToSocket();  to debug on browser

    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      } else {
        // Show some error
      }

      PushNotifications.addListener('registration', (token: Token) => {
        alert('Push registration success, token: ' + token.value);
        this.token = token.value;
        this.connectToSocket();
      });

      PushNotifications.addListener('registrationError', (error: any) => {
        alert('Error on registration: ' + JSON.stringify(error));
      });

      PushNotifications.addListener(
        'pushNotificationReceived',
        (notification: PushNotificationSchema) => {
          alert('Push received: ' + JSON.stringify(notification));
        },
      );

      PushNotifications.addListener(
        'pushNotificationActionPerformed',
        (notification: ActionPerformed) => {
          alert('Push action performed: ' + JSON.stringify(notification));
        },
      );
    });
  }

  connectToSocket() {
    this.socket = io(this.serverUrl);

    // Subscribe to a specific event
    this.socket.on('ttn-data', (data: any) => {
      try {
        console.log("data received");
        const jsonData = JSON.parse(data);

        // Now you can access properties of the JSON data
        const deviceID = jsonData.end_device_ids.device_id;
        const payload = jsonData.uplink_message.decoded_payload;
        const receivedDate = new Date(jsonData.received_at);
        const hours = receivedDate.getHours();
        const minutes = receivedDate.getMinutes();
        const seconds = receivedDate.getSeconds();

        // Format the time
        const formattedTime = `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(seconds)}`;

        // Log or process the data as needed
        console.log(`Received data from ${deviceID}:`, receivedDate);

        // Store the message
        //this.messages.push(`Alert raisd by ${deviceID} at ${receivedDate}: ${JSON.stringify(payload)}`);
        this.messages.push(`Alert raisd by ${deviceID} at ${formattedTime}`);
        this.messageList = this.messages.join('\n');
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    });

    //When connected server, send the token and device
    this.socket.on("client-connected", () => {
      if (this.token != "") this.socket.emit("firebase-token", { token: this.token, deviceId: "lora1", isActive: this.pushNotificationsEnabled});
    })

    // Connect to the server
    this.socket.connect();
    this.connected = true;
  }

  disconnectFromSocket() {
    if (this.socket) {
      // Disconnect when done
      this.socket.disconnect();
      this.connected = false;
    }
  }

  toggleChanged() {
    // Code to execute when the toggle state changes
    console.log('Toggle state changed:', this.pushNotificationsEnabled);
    this.socket.emit("client-set-state", { deviceId: "lora1", isActive: this.pushNotificationsEnabled });
  }

  padZero(num : number) {
    return num < 10 ? `0${num}` : num;
  }
}