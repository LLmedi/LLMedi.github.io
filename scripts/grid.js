class Grid {
    constructor(){
        this.speedZ = 5;
    
        let divisions = 30;
        let gridLimit = 200;
        this.grid = new THREE.GridHelper(gridLimit * 2, divisions, 0xccddee, 0xccddee);

        const moveableZ = [];

        for (let i = 0; i <= divisions; i++) {
            moveableZ.push(1, 1, 0, 0); // move horizontal lines only (1 - point is moveable)
        }

        this.grid.geometry.setAttribute('moveableZ', new THREE.BufferAttribute(new Uint8Array(moveableZ), 1));

        this.grid.material = new THREE.ShaderMaterial({
            uniforms: {
                speedZ: {
                    value: this.speedZ
                },
                gridLimits: {
                    value: new THREE.Vector2(-gridLimit, gridLimit)
                },
                time: {
                    value: 0
                }
            },
            vertexShader: `
                uniform float time;
                uniform vec2 gridLimits;
                uniform float speedZ;
                
                attribute float moveableZ;
                
                varying vec3 vColor;
            
                void main() {
                    vColor = color;
                    float limLen = gridLimits.y - gridLimits.x;
                    vec3 pos = position;
                    if (floor(moveableZ + 0.5) > 0.5) { // if a point has "moveableZ" attribute = 1 
                        float zDist = speedZ * time;
                        float curZPos = mod((pos.z + zDist) - gridLimits.x, limLen) + gridLimits.x;
                        pos.z = curZPos;
                    }
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
            
                void main() {
                gl_FragColor = vec4(vColor, 1.); // r, g, b channels + alpha (transparency)
                }
            `,
            vertexColors: THREE.VertexColors
        });

    }
    _updateGrid() {
        this.grid.material.uniforms.time.value = this.time;
    }
}