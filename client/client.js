import natives from 'natives';
import alt from 'alt';
import registeredObjects from 'client/objects';

const DEBUG_MODE = true;
const OBJECT_RANGE = 30;
const CHECK_INTERVAL = 1000;
const CURSOR_TOGGLE_KEY = 122; // F11

if (DEBUG_MODE) {
    var mainView = new alt.WebView('http://resource/client/html/index.html');
}

var currentExistingObjects = [];
var cursorActive = false;

function toggleCursor() {
    alt.showCursor(!cursorActive);
    alt.toggleGameControls(cursorActive);
    cursorActive = !cursorActive;
}

function removeObjectFromPlayer(player) {
    var object = currentExistingObjects[player.id];
    if (object && natives.doesEntityExist(object)) {
        natives.detachEntity(object, true, true);
        natives.deleteObject(object);
        currentExistingObjects[player.id] = null;
        // Show weapon again
        natives.setPedCurrentWeaponVisible(player.scriptID, true, true, true, true);
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

    if (newObject) {
        // Hide weapon before attaching object
        natives.setPedCurrentWeaponVisible(player.scriptID, false, true, true, true);

        natives.attachEntityToEntity(newObject, player.scriptID, boneIndex, positionX, positionY, positionZ, rotationX, rotationY, rotationZ, 
            false, false, false, false, 1, true);  

        currentExistingObjects[player.id] = newObject;
    } else {
        console.log('[ObjectAttacher] Object is null: ' + objectName)
    }
}

function attachRegisteredObjectToPlayer(player, objectName) {
    if (registeredObjects[objectName]) {
        var objectData = registeredObjects[objectName];
        attachObjectToPlayer(player, objectData.boneId, objectData.objectName, objectData.position.x, objectData.position.y, objectData.position.z, 
            objectData.rotation.x, objectData.rotation.y, objectData.rotation.z);
    } else {
        console.log('[ObjectAttacher] Object is not registered: ' + objectName);
    }
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
                    // Attach object to remote player
                    attachRegisteredObjectToPlayer(remotePlayer, objectOfRemotePlayer);
                }
            } else {
                // Players is holding object, but is not in range anymore
                if(!isRemotePlayerInRange) {
                    removeObjectFromPlayer(remotePlayer);
                }
            }
        } else {
            // Remove object, if player was holding one before
            removeObjectFromPlayer(remotePlayer);
        }
    });
}, CHECK_INTERVAL);

alt.on('objectAttacher:attachObject', (objectName) => {
    attachRegisteredObjectToPlayer(alt.Player.local, objectName);
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