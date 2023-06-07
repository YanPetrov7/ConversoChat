/* eslint-disable */

'use strict';

// Retrieve URL parameters
const urlParams = new URLSearchParams(window.location.search);
// Get the 'sender' from URL parameters
const sender = urlParams.get('user');
// WebSocket URL
const wsUrl = 'ws://localhost:3000';

// Variables for managing the current dialog
let receiver;
let currentDialog = null;

// Object to track unread messages per contact
let unreadMessages = {};

// Update the page title with the sender's name
const h1Element = document.getElementById('pageTitle');
h1Element.innerText = `${sender}`;

// Function to create a chat div for another div
const createDivInOtherDiv = (parentDiv, childDivId, childDivName) => {
  const childDiv = document.createElement('div');
  childDiv.id = `chat_${childDivId}`;
  if (childDivName) {
    childDiv.innerHTML = `<h2>${childDivName}</h2>`;
  } else {
    // If there is no div name, use id instead
    childDiv.innerHTML = `<h2>${childDivId}</h2>`;
  }
  return childDiv;
};

const ws = new WebSocket(wsUrl);

ws.onopen = () => {
  try {
    console.log('WebSocket connection established');
    ws.send(JSON.stringify({ username: sender }));
  } catch (error) {
    console.error('Error in ws.onopen: ', error);
  }
};

ws.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);

    if ('contacts' in data) {
      populateContactsList(data.contacts);
      populateUsersList(data.users);
      notificationSound.muted = data.notificationSoundStatus;
      const notificationSwitcher = document.getElementById(
        'notificationSwitcher'
      );
      if (!notificationSound.muted) {
        notificationSwitcher.innerText = 'Sound Off';
      } else {
        notificationSwitcher.innerText = 'Sound On';
      }
    }

    // Check if the received data is empty
    if (data.length === 0) {
      return;
    }

    const firstItem = data[0];

    if (typeof firstItem === 'object') {
      // Handle history items
      if ('history' in firstItem) {
        let messageList = document.getElementById('messageList');
        data.forEach((item) => {
          const listItem = getListItem(item.sender, item.history)
          document.getElementById('messageList').appendChild(listItem);
        });
        // Set scrollbar to the lowest position
        messageList.scrollTop = messageList.scrollHeight;
      }
      // Handle messages from WebSocket session
      if ('message' in firstItem) {
        console.log(
          `Message from: ${firstItem.sender}, message: ${firstItem.message}`
        );
        notifyNewMessage(firstItem.sender, firstItem.message);

        // Check if sender is a new contact
        const contactsContainer = document.getElementById('contacts-container');
        let isNewContact = true;
        for (let i = 0; i < contactsContainer.children.length; i++) {
          if (contactsContainer.children[i].innerText === firstItem.sender) {
            isNewContact = false;
            break;
          }
        }

        if (isNewContact) {
          addContact(firstItem.sender);
          isNewContact = false;
        }

        // Check if the message belongs to the current dialog
        if (firstItem.sender !== currentDialog) {
          return;
        }

        data.forEach((item) => {
          const listItem = getListItem(item.sender, item.message)
          document.getElementById('messageList').appendChild(listItem);
        });
      }
    }
  } catch (error) {
    console.error('Error in ws.onmessage: ', error);
  }
};

const addContact = (newContact) => {
  try {
    const contactsContainer = document.getElementById('contacts-container');
    const button = document.createElement('button');
    button.id = `contact_${newContact}`;
    button.innerText = newContact;
    button.onclick = () => openDialog(newContact);
    contactsContainer.appendChild(button);
  } catch (error) {
    console.error('Error in addContact: ', error);
  }
};

// Function to open a dialog with a selected contact
const openDialog = (selectedContact) => {
  try {
    // Clear the message list
    document.getElementById('messageList').innerHTML = '';

    // Update the current dialog and chat section
    currentDialog = selectedContact;
    document.getElementById('dialogTitle').innerText = `Dialog with: ${selectedContact}`;
    
    receiver = selectedContact;
    // Send a request to the WebSocket server to open the dialog
    const data = {sender: sender, receiver: selectedContact};
    ws.send(JSON.stringify(data));
    console.log(`Dialog between ${data.sender} and ${data.receiver} opened!`);
  } catch (error) {
    console.error('Error in openDialog: ', error);
  }
};

// Function to send a message
const sendMessage = () => {
  try {
    const message = document.getElementById('msg').value;

    // Check if there is a message and receiver specified
    if (message && receiver) {
      const listItem = getListItem(sender, message)
      document.getElementById('messageList').appendChild(listItem);

      // Send the message to the WebSocket server
      const data = {sender, message, receiver};
      ws.send(JSON.stringify(data));

      // Check if reciver user is already in our contacts
      const contactsContainer = document.getElementById('contacts-container');
      let isNewContact = true;
      for (let i = 0; i < contactsContainer.children.length; i++) {
        if (contactsContainer.children[i].innerText === receiver) {
          isNewContact = false;
          break;
        }
      }

      if (isNewContact) {
        addContact(receiver);
        isNewContact = false;
      }
      console.log(
        `message: ${message}, receiver: ${receiver}, sender: ${sender}`
      );
      document.getElementById('msg').value = '';
    } else {
      const error = 'Error: There is no message or receiver';
      alert(error);
      console.log(error);
    }
  } catch (error) {
    console.error('Error in sendMessage: ', error);
  }
};

// Function to search users by name
const searchUsers = () => {
  try {
    const input = document.getElementById('userSearch');
    const filter = input.value.toLowerCase();
    const userList = document.getElementById('userList');
    const options = userList.getElementsByTagName('option');

    Array.from(options).forEach((option) => {
      const username = option.text.toLowerCase();
      if (!username.includes(filter)) {
        option.style.display = 'none';
      } else {
        option.style.display = '';
      }
    });
  } catch (error) {
    console.error('Error in searchUsers: ', error);
  }
};

// Function to populate the contacts list
const populateContactsList = (contacts) => {
  try {
    const contactsContainer = document.getElementById('contacts-container');
    contacts.forEach((contact) => {
      addContact(contact);
    });
  } catch (error) {
    console.error('Error in populateContactsList: ', error);
  }
};

// Function to populate the users list
const populateUsersList = (users) => {
  try {
    const userList = document.getElementById('userList');
    users.forEach((user) => {
      const option = document.createElement('option');
      option.value = user;
      option.innerText = user;
      userList.appendChild(option);
    });
  } catch (error) {
    console.error('Error in populateUsersList: ', error);
  }
};

// Function to handle new messages
const notifyNewMessage = (sender, message) => {
  try {
    const notificationSound = document.getElementById('notificationSound');
    notificationSound.play();

    // Show a notification
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        const notification = new Notification(`${sender} sent a new message`, {
          body: message
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            const notification = new Notification(
              `${sender} sent a new message`,
              { body: message }
            );
          }
        });
      }
    }
  } catch (error) {
    console.error('Error in notifyNewMessage: ', error);
  }
};

// Function to toggle notification sound
const notificationSwitch = () => {
  try {
    const notificationSound = document.getElementById('notificationSound');
    const notificationSwitcher = document.getElementById('notificationSwitcher');
    if (notificationSound.muted) {
      notificationSound.muted = false;
      notificationSwitcher.innerText = 'Sound Off';
    } else {
      notificationSound.muted = true;
      notificationSwitcher.innerText = 'Sound On';
    }
    ws.send(JSON.stringify({ notificationSoundStatus: notificationSound.muted }));
  } catch (error) {
    console.error('Error in notificationSwitch: ', error);
  }
};

// Write message to message window
const getListItem = (messageSender, message) => {
  try {
    const listItem = document.createElement('li');
    const senderElement = document.createElement('span');
    senderElement.innerText = messageSender;
    if (messageSender !== sender) {
      senderElement.style.color = 'blue';
    } else {
      senderElement.style.color = 'red';
    }
    listItem.appendChild(senderElement);
    listItem.innerHTML += `: ${message}`;
    return listItem;
  } catch (error) {
    console.error('Error in getListItem: ', error);
  }
}