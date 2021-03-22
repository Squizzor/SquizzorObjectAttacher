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
        animationDict: '',
        animationName: '',
        animationFlag: 49
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
                this.objectString = '\'' + this.objectKey + '\': { objectName: \'' + this.objectName + '\', boneId: ' + this.boneId + ', position: { x: '
                    + this.position.x + ', y: ' + this.position.y + ', z: ' + this.position.z + ', }, rotation: { x: ' 
                    + this.rotation.x + ', y: ' + this.rotation.y + ', z: ' + this.rotation.z + '},\n' 
                    + '  animationDict: \'' + this.animationDict + '\', animationName: \'' + this.animationName + '\' }'; 
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
        changeAnimation() {
            alt.emit('objectAttacher:debug:changeAnimation', this.animationDict, this.animationName, this.animationFlag);
        },
        resetAnimation() {
            alt.emit('objectAttacher:debug:resetAnimation');
        },
        onAnimationChange() {
            this.changeAnimation();
        },
        onRegisteredObjectChange() {
            if (this.registeredObjects && this.registeredObjects[this.selectedRegisteredObject]) {
                var object = this.registeredObjects[this.selectedRegisteredObject];
                this.objectKey = this.selectedRegisteredObject;
                this.objectName =  object.objectName;
                this.boneId = object.boneId;
                this.position.x = object.position.x;
                this.position.y = object.position.y;
                this.position.z = object.position.z;
                this.rotation.x = object.rotation.x;
                this.rotation.y = object.rotation.y;
                this.rotation.z = object.rotation.z;
                this.animationDict = object.animationDict;
                this.animationName = object.animationName;
                this.updateObjectString();
                this.attachObject();
                this.changeAnimation();
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