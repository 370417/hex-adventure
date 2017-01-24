// Constants for map tiles

const keys = ['name'         , 'canWalk', 'transparent', 'canFly', 'color'];
const vals = [//             ,          ,              ,         ,        ],
             ['WALL'         , false    , false        , false   , 'white'],
             ['FLOOR'        , true     , true         , true    , 'white'],
             ['DEEP_WATER'   , false    , true         , true    , 'blue' ],
             ['SHALLOW_WATER', true     , true         , true    , 'blue' ],
             ['PIT'          , false    , true         , true    , 'gray' ],
             ['RUBBLE'       , false    , true         , false   , 'peach'],
];


const Tiles = {};
for (let i = 0; i < vals.length; i++) {
    const properties = vals[i];
    const name = properties[0];
    const tile = {};
    for (let j = 0; j < keys.length; j++) {
        tile[keys[j]] = properties[j];
    }
    this[name] = name;
    Tiles[name] = tile;
}
