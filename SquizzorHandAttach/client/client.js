import natives from 'natives';
import alt from 'alt';

function getScriptId(playerId) {
    var scriptId = null;

    if (playerId == alt.Player.local.id) {
        scriptId = alt.Player.local.scriptID;
    } else {
        var player = alt.Player.getByID(playerId);
        if (player) {
            scriptId = player.scriptID;
        }
    }

    return scriptId;
}


alt.on('test', (type) => {
    console.log('test');
});

alt.emit('test');

alt.onServer('tslipsync:onStartTalking', (playerId) => {
    var scriptId = getScriptId(playerId);
    if (scriptId) {
        natives.playFacialAnim(scriptId, 'mic_chatter', 'mp_facial');
    }
});

alt.onServer('tslipsync:onStopTalking', (playerId) => {
    var scriptId = getScriptId(playerId);
    if (scriptId) {
        var isMale = natives.isPedMale(scriptId);
        var animationName = '';

        if (isMale) {
            animationName = 'facials@gen_male@variations@normal';
        } else {
            animationName = 'facials@gen_female@variations@normal';
        }

        natives.playFacialAnim(scriptId, 'mood_normal_1', animationName);
    }
});