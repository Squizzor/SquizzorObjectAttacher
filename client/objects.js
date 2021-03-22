const BONEID_RIGHT_HAND = 57005;

const registeredObjects = {
    'phone': { objectName: 'p_amb_phone_01', boneId: BONEID_RIGHT_HAND, position: { x: 0.15, y: 0.0, z: -0.043, }, rotation: { x: 15.0, y: 80.0, z: 150 }, 
        animationDict: 'cellphone@', animationName: 'cellphone_text_in' },
    'tablet': { objectName: 'prop_cs_tablet', boneId: 60309, position: { x: 0.03, y: -0.000, z: 0, }, rotation: { x: 10, y: 0, z: -10},
        animationDict: 'amb@code_human_in_bus_passenger_idles@female@tablet@base', animationName: 'base' }
};

export default registeredObjects;