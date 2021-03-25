var controller = new Vue({
    el: '#form',
    data: {
        activeTab: 1,

        registeredObjects: [],
        selectedRegisteredObject: '',

        positionSliderStep: 0.01,
        positionSliderMin: -2.0,
        positionSliderMax: 2.0,
        rotationSliderStep: 5,
        rotationSliderMin: -360,
        rotationSliderMax: 360,

        objectKey: 'myobject',
        objectString: '',
        objectName: '',
        boneId: 0,

        position: {
            x: 0,
            y: 0,
            z: 0,
        },

        rotation: {
            x: 0,
            y: 0,
            z: 0
        },

        enterAnimation: {
            dict: '',
            name: '',
            flag: 49,
            durationMs: 0            
        },

        exitAnimation: {
            dict: '',
            name: '',
            flag: 49,
            durationMs: 0            
        },

        autoPlaySequenceOnChange: true,
        detachObjectAfterSequence: true
    },
    methods: {
        setActiveTab(tab) {
            this.activeTab = tab;
        },
        attachObject() {
            alt.emit('objectAttacher:debug:attachObject', this.objectName, this.boneId, this.position.x, this.position.y, this.position.z, 
                this.rotation.x, this.rotation.y, this.rotation.z);
        },
        detachObject() {
            alt.emit('objectAttacher:debug:detachObject');
        },
        updateObjectString() {
            if (this.objectKey) {
                this.objectString = '\'' + this.objectKey + '\': { objectName: \'' + this.objectName + '\', boneId: ' + this.boneId + ', '
                    + 'position: { x: ' + this.position.x + ', y: ' + this.position.y + ', z: ' + this.position.z + ', }, '
                    + 'rotation: { x: ' + this.rotation.x + ', y: ' + this.rotation.y + ', z: ' + this.rotation.z + '},\n' 
                    + '  enterAnimation: { dict: \'' + this.enterAnimation.dict + '\', name: \'' + this.enterAnimation.name + '\', flag: ' + this.enterAnimation.flag + ', durationMs: ' + this.enterAnimation.durationMs + ' },\n' 
                    + '  exitAnimation: { dict: \'' + this.exitAnimation.dict + '\', name: \'' + this.exitAnimation.name + '\', flag: ' + this.exitAnimation.flag + ', durationMs: ' + this.exitAnimation.durationMs + ' } }' 
            } else {
                this.objectString = 'object key not set';
            }
        },
        onObjectChange() {
            this.updateObjectString();
            this.attachObject();
        },
        copyObjectString() {
            var objectStringInput = document.querySelector('#object-string')
            objectStringInput.select()
            document.execCommand('copy');
        },
        playEnterAnimation() {
            alt.emit('objectAttacher:debug:playAnimation', this.enterAnimation);
        },
        playExitAnimation() {
            alt.emit('objectAttacher:debug:playAnimation', this.exitAnimation);
        },
        playSequence() {
            this.attachObject();
            alt.emit('objectAttacher:debug:playSequence', this.enterAnimation, this.exitAnimation, this.detachObjectAfterSequence);
        },
        resetAnimation() {
            alt.emit('objectAttacher:debug:resetAnimation');
        },
        onAnimationChange() {
            this.updateObjectString();
            if (this.autoPlaySequenceOnChange) {
                this.playSequence();
            }
        },
        onRegisteredObjectChange() {
            if (this.registeredObjects && this.registeredObjects[this.selectedRegisteredObject]) {
                var object = this.registeredObjects[this.selectedRegisteredObject];
                this.objectKey = this.selectedRegisteredObject;
                this.objectName =  object.objectName;
                this.boneId = object.boneId;
                this.position = object.position;
                this.rotation = object.rotation;
                this.enterAnimation = object.enterAnimation;
                this.exitAnimation = object.exitAnimation;
                this.updateObjectString();
                if (this.autoPlaySequenceOnChange) {
                    this.playSequence();
                } else {
                    this.attachObject();
                }
            }
        }
    }
});

alt.on('objectAttacher:debug:setRegisteredObjects', (registeredObjects) => {
    controller.registeredObjects = registeredObjects;
});

window.onload = function(){
    alt.emit('objectAttacher:debug:requestRegisteredObjects');
};