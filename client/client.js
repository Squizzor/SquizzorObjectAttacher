import natives from 'natives';
import alt from 'alt';
import registeredObjects from 'client/objects';

const DEBUG_MODE = true;
const OBJECT_RANGE = 30;
const CHECK_INTERVAL = 1000;
const CURSOR_TOGGLE_KEY = 122; // F11

let currentExistingObjects = [];
let cursorActive = false;

function outputMessage(message) {
    console.log('[ObjectAttacher] ' + message);
}

function toggleCursor() {
    try {
        alt.showCursor(!cursorActive);
        alt.toggleGameControls(cursorActive);
        cursorActive = !cursorActive;
    } catch(e) {
        outputMessage(e.message);
    }
}

function getRegisteredObject(objectName) {
    if (registeredObjects[objectName]) {
        return registeredObjects[objectName];
    } else {
        outputMessage('Object is not registered: ' + objectName);
        return null;
    }    
}

function resetAnimationOnLocalPlayer() {
    try {
        natives.clearPedTasks(alt.Player.local.scriptID);
    } catch(e) {
        outputMessage(e.message);
    }
}

function removeObjectFromPlayer(player) {
    try {
        let object = currentExistingObjects[player.id];
        if (object && natives.doesEntityExist(object)) {
            natives.detachEntity(object, true, true);
            natives.deleteObject(object);
            currentExistingObjects[player.id] = null;
            // Show weapon again
            natives.setPedCurrentWeaponVisible(player.scriptID, true, true, true, true);
        }
    } catch(e) {
        outputMessage(e.message);
    }
}

function attachObjectToPlayer(player, boneId, objectName, positionX, positionY, positionZ, rotationX, rotationY, rotationZ) {
    try {
        // Remove existing object (if exists)
        removeObjectFromPlayer(player);

        let hashOfProp = natives.getHashKey(objectName);

        natives.requestModel(hashOfProp);
        const modelLoadInterval = alt.setInterval(() => {
            if (natives.hasModelLoaded(hashOfProp)) {
                alt.clearInterval(modelLoadInterval);
            } 
        }, 100);

        let newObject = natives.createObject(hashOfProp, player.pos.x, player.pos.y, player.pos.z, true, true, true);

        // Release memory for model
        natives.setModelAsNoLongerNeeded(hashOfProp);
        
        let boneIndex = natives.getPedBoneIndex(player.scriptID, Number(boneId)); 

        if (newObject) {
            // Hide weapon before attaching object
            natives.setPedCurrentWeaponVisible(player.scriptID, false, true, true, true);

            natives.attachEntityToEntity(newObject, player.scriptID, boneIndex, Number(positionX), Number(positionY), Number(positionZ), 
                Number(rotationX), Number(rotationY), Number(rotationZ), false, false, false, false, 1, true);  

            currentExistingObjects[player.id] = newObject;
        } else {
            outputMessage('Object is null: ' + objectName);
        }
    } catch(e) {
        outputMessage(e.message);
    }
}

function attachRegisteredObjectToPlayer(player, objectData) {
    if (objectData) {
        attachObjectToPlayer(player, objectData.boneId, objectData.objectName, objectData.position.x, objectData.position.y, objectData.position.z, 
            objectData.rotation.x, objectData.rotation.y, objectData.rotation.z);
    } 
}

function attachRegisteredObjectToLocalPlayerSynced(objectName, objectData) {
    if (objectData) {
        attachRegisteredObjectToPlayer(alt.Player.local, objectData);
        alt.emitServer('objectAttacher:attachedObject', objectName);
    }
}

function detachObjectFromLocalPlayerSynced() {
    removeObjectFromPlayer(alt.Player.local);
    resetAnimationOnLocalPlayer();
    alt.emitServer('objectAttacher:detachedObject'); 
}

function attachRegisteredObjectToLocalPlayerAnimated(objectName, detachObjectAfterAnimation) {
    let registeredObject = getRegisteredObject(objectName);
    if (registeredObject) {
        attachRegisteredObjectToLocalPlayerSynced(objectName, registeredObject);
        playAnimationSequenceOnLocalPlayer(registeredObject.enterAnimation, registeredObject.exitAnimation, () => {
            if (detachObjectAfterAnimation) {
                detachObjectFromLocalPlayerSynced();
            }
        });
    }
}

function playAnimationOnLocalPlayer(animDictionary, animationName, animationFlag) {
    try {
        if (natives.doesAnimDictExist(animDictionary)) {
            natives.requestAnimDict(animDictionary);

            const animDictLoadInterval = alt.setInterval(() => {
                if (natives.hasAnimDictLoaded(animDictionary)) {
                    alt.clearInterval(animDictLoadInterval)
                } 
            }, 100)

            natives.taskPlayAnim(alt.Player.local.scriptID, animDictionary, animationName, 8.0, 8.0, -1, Number(animationFlag), 1.0, false, false, false);
        } else {
            outputMessage('Animation dictionary does not exist');
        }
    } catch(e) {
        outputMessage(e.message);
    }
}

function playAnimationSequenceOnLocalPlayer(enterAnimation, exitAnimation, sequenceFinishedCallback) {
    let enterAnimationIsSet = enterAnimation && enterAnimation.dict && enterAnimation.name;
    let exitAnimationIsSet = exitAnimation && exitAnimation.dict && exitAnimation.name;

    let firstAnimation = null;
    let secondAnimation = null; 

    // Only play animations that are completely set
    if (enterAnimationIsSet) {
        firstAnimation = enterAnimation;
        if (exitAnimationIsSet) {
            secondAnimation = exitAnimation; 
        }
    } else if (exitAnimationIsSet) {
        firstAnimation = exitAnimation;
    }

    if (firstAnimation) {
        resetAnimationOnLocalPlayer();

        playAnimationOnLocalPlayer(firstAnimation.dict, firstAnimation.name, firstAnimation.flag);

        if (firstAnimation.durationMs && firstAnimation.durationMs > 0) {
            alt.setTimeout(() => {
                if (secondAnimation) {
                    playAnimationOnLocalPlayer(secondAnimation.dict, secondAnimation.name, secondAnimation.flag);

                    if (secondAnimation.durationMs && secondAnimation.durationMs > 0) {
                        alt.setTimeout(() => {
                            resetAnimationOnLocalPlayer();
                            sequenceFinishedCallback();
                        }, secondAnimation.durationMs);
                    }
                } else {
                    resetAnimationOnLocalPlayer();
                    sequenceFinishedCallback();
                }
            }, firstAnimation.durationMs);
        }
    }
}

// Interval for attaching and removing objects from remote players
alt.setInterval(() => {
    try {
        alt.Player.all.forEach(remotePlayer => {
            // Skip local player
            if (remotePlayer.id == alt.Player.local.id) {
                return;
            }
                
            let objectOfRemotePlayer = remotePlayer.getSyncedMeta('AttachedObject');
    
            if (objectOfRemotePlayer) {
                let isRemotePlayerInRange = remotePlayer.scriptID && remotePlayer.pos.isInRange(alt.Player.local.pos, OBJECT_RANGE);
    
                // Object not created yet?
                if (!currentExistingObjects[remotePlayer.id]) {
                    if (isRemotePlayerInRange) {
                        // Attach object to remote player
                        attachRegisteredObjectToPlayer(remotePlayer, getRegisteredObject(objectOfRemotePlayer));
                    }
                } else {
                    // Players is holding object, but is not in range anymore
                    if (!isRemotePlayerInRange) {
                        removeObjectFromPlayer(remotePlayer);
                    }
                }
            } else {
                // Remove object, if player was holding one before
                removeObjectFromPlayer(remotePlayer);
            }
        });
    } catch(e) {
        outputMessage(e.message);
    }
}, CHECK_INTERVAL);

alt.on('objectAttacher:attachObjectAnimated', (objectName, detachObjectAfterAnimation) => {
    attachRegisteredObjectToLocalPlayerAnimated(objectName, detachObjectAfterAnimation);
});

alt.onServer('objectAttacher:attachObjectAnimated', (objectName, detachObjectAfterAnimation) => {
    attachRegisteredObjectToLocalPlayerAnimated(objectName, detachObjectAfterAnimation);
});

alt.on('objectAttacher:attachObject', (objectName) => {
    attachRegisteredObjectToLocalPlayerSynced(objectName, getRegisteredObject(objectName));
});

alt.onServer('objectAttacher:attachObject', (objectName) => {
    attachRegisteredObjectToLocalPlayerSynced(objectName, getRegisteredObject(objectName));
});

alt.on('objectAttacher:detachObject', () => {
    detachObjectFromLocalPlayerSynced();
});

alt.onServer('objectAttacher:detachObject', () => {
    detachObjectFromLocalPlayerSynced();
});

if (DEBUG_MODE) {
    var mainView = new alt.WebView('/resource/client/html/index.html');
    mainView.focus();

    alt.setInterval(() => {
        natives.invalidateIdleCam();
    }, 2000);

    mainView.on('load', () => {
        mainView.emit('objectAttacher:debug:setRegisteredObjects', registeredObjects);
    });

    mainView.on('objectAttacher:debug:attachObject', (objectName, boneId, positionX, positionY, positionZ, rotationX, rotationY, rotationZ) => {
        attachObjectToPlayer(alt.Player.local, boneId, objectName, positionX, positionY, positionZ, rotationX, rotationY, rotationZ);
    });

    mainView.on('objectAttacher:debug:detachObject', () => {
        removeObjectFromPlayer(alt.Player.local);
    });

    mainView.on('objectAttacher:debug:playAnimation', (animation) => {
        playAnimationOnLocalPlayer(animation.dict, animation.name, animation.flag);

        if (animation.durationMs && animation.durationMs > 0) {
            alt.setTimeout(() => {
                resetAnimationOnLocalPlayer();
            }, animation.durationMs);
        }
    });

    mainView.on('objectAttacher:debug:playSequence', (enterAnimation, exitAnimation, detachObjectAfterSequence) => {
        playAnimationSequenceOnLocalPlayer(enterAnimation, exitAnimation, () => {
            if (detachObjectAfterSequence) {
                removeObjectFromPlayer(alt.Player.local);
            }
        });
    });

    mainView.on('objectAttacher:debug:resetAnimation', () => {
        resetAnimationOnLocalPlayer();
    });

    alt.on('consoleCommand', (command, ...args) => {
        if (command === 'objectattacher') {
            mainView.isVisible = !mainView.isVisible;
            if (mainView.isVisible) {
                mainView.focus();
            }
        }
    });

    alt.on('keyup', function (key) {
        if (key == CURSOR_TOGGLE_KEY) { 
            toggleCursor();
        }
    });
}