import natives from 'natives';
import alt from 'alt';

const DEBUG_MODE = false;
const OBJECT_RANGE = 30;
const CHECK_INTERVAL = 1000;
const CURSOR_TOGGLE_KEY = 122; // F11

const BONEID_RIGHT_HAND = 57005;

const objects = {
    'phone': { objectName: 'p_amb_phone_01', boneId: BONEID_RIGHT_HAND, position: { x: 0.15, y: 0.0, z: -0.043, }, rotation: { x: 15.0, y: 80.0, z: 150 } }
};

if (DEBUG_MODE) {
    var mainView = new alt.WebView('http://resources/SquizzorObjectAttacher/client/html/index.html');
}

var currentExistingObjects = [];
var cursorActive = false;

function toggleCursor() {
    alt.showCursor(!cursorActive);
    alt.toggleGameControls(cursorActive);
    cursorActive = !cursorActive;
}

function getObjectData(objectName) {
    return objects[objectName];
}

function removeObjectFromPlayer(player) {
    var object = currentExistingObjects[player.id];
    if (object) {
        natives.detachEntity(object, true, true);
        natives.deleteObject(object);
        currentExistingObjects[player.id] = null;
    }
}

function attachObjectToPlayer(player, boneId, objectName, positionX, positionY, positionZ, rotationX, rotationY, rotationZ) {
    // Remove existing object (if exists)
    removeObjectFromPlayer(player);

    var hashOfProp = natives.getHashKey(objectName);
    var newObject = natives.createObject(hashOfProp, player.pos.x, player.pos.y, player.pos.z, true, true, true);

    // Release memory for model
    natives.setModelAsNoLongerNeeded(hashOfProp);
    
    var boneIndex = natives.getPedBoneIndex(player.scriptID, boneId); 

    natives.attachEntityToEntity(newObject, player.scriptID, boneIndex, positionX, positionY, positionZ, rotationX, rotationY, rotationZ, 
        false, false, false, false, 1, true);  

    currentExistingObjects[player.id] = newObject;
}

function playAnimationOnLocalPlayer(animDictionary, animationName) {
    natives.requestAnimDict(animDictionary);

    const animDictLoadInterval = alt.setInterval(() => {
        if (natives.hasAnimDictLoaded(animDictionary)) {
            alt.clearInterval(animDictLoadInterval)
        } 
    }, 10)

    natives.taskPlayAnim(alt.Player.local.scriptID, animDictionary, animationName, 8.0, 8.0, -1, 50, 1.0, false, false, false);
}

function resetAnimationOnLocalPlayer() {
    natives.clearPedTasks(alt.Player.local.scriptID);
}

// Interval for attaching and removing objects from remote players
alt.setInterval(() => {
    alt.Player.all.forEach(remotePlayer => {
        // Skip local player
        if (remotePlayer.id == alt.Player.local.id) {
            return;
        }
            
        var objectOfRemotePlayer = remotePlayer.getSyncedMeta('AttachedObject');      
        if (objectOfRemotePlayer) {
            var isRemotePlayerInRange = remotePlayer.pos.isInRange(alt.Player.local.pos, OBJECT_RANGE);

            // Object not created yet?
            if (!currentExistingObjects[remotePlayer.id]) {
                if (isRemotePlayerInRange) {
                    var objectData = getObjectData(objectOfRemotePlayer);
                    // Attach object to remote player
                    attachObjectToPlayer(remotePlayer, objectData.boneId, objectData.objectName, objectData.position.x, objectData.position.y, objectData.position.z,
                        objectData.rotation.x, objectData.rotation.y, objectData.rotation.z);
                }
            } else {
                // Players is holding object, but is not in range anymore
                if(!isRemotePlayerInRange) {
                    removeObjectFromPlayer(remotePlayer);
                }
            }
        } else {
            // Remove object (if exists)
            removeObjectFromPlayer(remotePlayer);
        }
    });
}, CHECK_INTERVAL);

alt.on('objectAttacher:attachObject', (objectName) => {
    var objectData = getObjectData(objectName);

    attachObjectToPlayer(alt.Player.local, objectData.boneId, objectData.objectName, objectData.position.x, objectData.position.y, objectData.position.z, 
        objectData.rotation.x, objectData.rotation.y, objectData.rotation.z);
   
    alt.emitServer('objectAttacher:attachedObject', objectName);
});

alt.on('objectAttacher:detachObject', () => {
    removeObjectFromPlayer(alt.Player.local);
    alt.emitServer('objectAttacher:detachedObject');
});

if (DEBUG_MODE) {
    mainView.on('objectAttacher:debug:attachObject', (objectName, boneId, positionX, positionY, positionZ, rotationX, rotationY, rotationZ) => {
        attachObjectToPlayer(alt.Player.local, boneId, objectName, positionX, positionY, positionZ, rotationX, rotationY, rotationZ);
    });

    mainView.on('objectAttacher:debug:detachObject', () => {
        removeObjectFromPlayer(alt.Player.local);
    });

    mainView.on('objectAttacher:debug:changeAnimation', (animationDict, animationName) => {
        playAnimationOnLocalPlayer(animationDict, animationName);
    });

    mainView.on('objectAttacher:debug:resetAnimation', () => {
        resetAnimationOnLocalPlayer();
    });

    alt.on("keyup", function (key) {
        if (key == CURSOR_TOGGLE_KEY) { 
            toggleCursor();
        }
    });
}