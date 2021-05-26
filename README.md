# Squizzor Object Attacher


## About
This alt:V resource allows you to easily attach objects to players for example a phone, food or a bottle. The attachment will also be synced with all near by players.

![Debug form](https://github.com/Squizzor/SquizzorObjectAttacher/blob/master/images/preview.png)

## How to use
Create a new folder in the server resources folder and copy the files into it. Add the folder name to your resources section of your server.cfg.

## Register an object
Before you can attach an object, it has to be in the registered objects array (**client/objects.js**). There are already a few objects in it, so please check if the desired object was already added. If its not, the easiest way to add a new one is to use the debug form. This form automatically shows up, if the **DEBUG_MODE** constant is set to true (client/client.js).

#### Debug form

![Debug form](https://github.com/Squizzor/SquizzorObjectAttacher/blob/master/images/debug.png)

In the debug form you can try out new objects and change their position easily ingame. You can also do this in combination with an animation. To access the controls, the cursor needs to be activated. The default key for that is F11 (can be changed - see **Configuration**).

When using an animation, its advised to use 50 as animation flag, cause it freezes the animation at last frame making it easier to adjust the object position.

Please also note the options on the animation tab that allow you to avoid animation autoplay on parameter change or keeping the object after an animation finishes.

Type "objectattacher" into the console to hide the debug form.

Object names, bone ids and animations parameters can be looked up on google.

Already added objects can be accessed with the combo box at the top. 

If you completely set up a new object, you can just type in an object key at the bottom and use the "Copy object string" button to get the full object string, which just needs to be copied into the client/objects.js (don't forget to add a comma to the last entry before).

## Attach or detach an object
**!! Only registered objects can be attached to a player !!**

**!! A player can only hold one object at a time !!**

If you want to attach or detach an object, you can either do it on server side or on client side with the following code:

#### Client side
alt.emit('objectAttacher:attachObject', 'phone');

alt.emit('objectAttacher:detachObject');

#### Server side
alt.emitClient(playerObject, 'objectAttacher:attachObject', 'phone');

alt.emitClient(playerObject, 'objectAttacher:detachObject');

## Configuration

In client/client.js there are some constants that can be configured. 

##### DEBUG_MODE
When the debug mode is enabled a little form will show up, which allows you test out new objects or modify existing ones (see **Debug form** above). This should be disabled on live server.

##### OBJECT_RANGE
This will define the range in meters, in which objects will be synced with other players.

##### CHECK_INTERVAL
This interval in milliseconds defines in which frequency near by players will be checked for object attachments.

##### CURSOR_TOGGLE_KEY
Defines which key code will be used to toggle the mouse cursor (default is F11). 

## Donate
[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/donate?hosted_button_id=DF9G7JCFMCBA6)