var controller = new Vue({
    el: '#form',
    data: {
        objectName: 'p_amb_phone_01',
        boneId: 57005,
        position: {
            x: 0.15,
            y: 0.0,
            z: -0.043,
        },
        rotation: {
            x: 15.0,
            y: 80.0,
            z: 150
        },
        animationDict: 'cellphone@',
        animationName: 'cellphone_text_in'
    },
    methods: {
        attachObject() {
            alt.emit('objectAttacher:debug:attachObject', this.objectName, this.boneId, this.position.x, this.position.y, this.position.z, 
                this.rotation.x, this.rotation.y, this.rotation.z);
        },
        detachObject() {
            alt.emit('objectAttacher:debug:detachObject');
        },
        changeAnimation() {
            alt.emit('objectAttacher:debug:changeAnimation', this.animationDict, this.animationName);
        },
        resetAnimation() {
            alt.emit('objectAttacher:debug:resetAnimation');
        }
    }
});