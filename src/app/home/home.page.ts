import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard, IonCardContent } from '@ionic/angular/standalone';
import {io} from 'socket.io-client';
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
  imports: [IonHeader, IonToolbar, IonTitle, IonContent,IonButton, IonCard, IonCardContent,CommonModule],
})

export class HomePage {
  constructor() {
  }

  serverUrl = 'http://13.49.217.91:1884';
  socket: any;
  connected = false;
  messages: string[] = [];

  ngOnInit() {
    console.log('Initializing HomePage');

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
    console.log("try to connect ....");
    this.socket = io(this.serverUrl);

   // this.socket = io(this.serverUrl) as SocketIOClient.Socket;;

    // Subscribe to a specific event
    this.socket.on('ttn-data', (data: any) => {
      try {
        const jsonData = JSON.parse(data);
  
        // Now you can access properties of the JSON data
        const deviceID = jsonData.end_device_ids.device_id;
        const payload = jsonData.uplink_message.decoded_payload;
        const receivedDate = new Date(jsonData.received_at);

        // Log or process the data as needed
        console.log(`Received data from ${deviceID}:`, receivedDate);
  
        // Store the message
      this.messages.push(`Alert raisd by ${deviceID} at ${receivedDate}: ${JSON.stringify(payload)}`);
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    });

    // You can subscribe to other events or perform additional actions here

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
}