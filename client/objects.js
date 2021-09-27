const BONEID_RIGHT_HAND = 57005;

const registeredObjects = {
    'phone': { objectName: 'p_amb_phone_01', boneId: BONEID_RIGHT_HAND, position: { x: 0.15, y: 0.0, z: -0.043, }, rotation: { x: 15.0, y: 80.0, z: 150 }, 
        enterAnimation: {dict: 'cellphone@', name: 'cellphone_text_in', flag: 49, durationMs: 1000 },
        exitAnimation: {dict: 'cellphone@', name: 'cellphone_text_out', flag: 49, durationMs: 1000 } },
    'tablet': { objectName: 'prop_cs_tablet', boneId: 60309, position: { x: 0.03, y: -0.000, z: 0, }, rotation: { x: 10, y: 0, z: -10},
        enterAnimation: {dict: 'amb@code_human_in_bus_passenger_idles@female@tablet@base', name: 'base', flag: 49, durationMs: 0 },
        exitAnimation: {dict: '', name: '', flag: 49, durationMs: 0 } },
    'bottle': { objectName: 'prop_beer_bottle', boneId: BONEID_RIGHT_HAND, position: { x: 0.13, y: -0.12, z: -0.05, }, rotation: { x: 100, y: -220, z: 180},
        enterAnimation: {dict: 'amb@world_human_drinking@beer@male@idle_a', name: 'idle_c', flag: 49, durationMs: 5000 },
        exitAnimation: {dict: '', name: '', flag: 49, durationMs: 0 } },
    'orange': { objectName: 'ng_proc_food_ornge1a', boneId: BONEID_RIGHT_HAND, position: { x: 0.16, y: 0.01, z: -0.01, }, rotation: { x: -15, y: -150, z: -95},
        enterAnimation: {dict: 'amb@code_human_wander_eating_donut@male@idle_a', name: 'idle_c', flag: 49, durationMs: 5000 },
        exitAnimation: {dict: '', name: '', flag: 49, durationMs: 0 } },
    'burger': { objectName: 'prop_cs_burger_01', boneId: BONEID_RIGHT_HAND, position: { x: 0.15, y: -0.02, z: -0.05, }, rotation: { x: -180, y: -150, z: -95},
        enterAnimation: {dict: 'amb@code_human_wander_eating_donut@male@idle_a', name: 'idle_c', flag: 49, durationMs: 5000 },
        exitAnimation: {dict: '', name: '', flag: 49, durationMs: 0 } },
    'fishing-rod': { objectName: 'prop_fishing_rod_01', boneId: 60309, position: { x: 0, y: -0.01, z: 0.01, }, rotation: { x: -180, y: -185, z: -175},
        enterAnimation: { dict: 'amb@world_human_stand_fishing@idle_a', name: 'idle_c', flag: 15, durationMs: 0 },
        exitAnimation: { dict: '', name: '', flag: 15, durationMs: 0 } }
};

export default registeredObjects;