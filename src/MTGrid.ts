import * as THREE from 'three'
import { Vector3 } from 'three'

function fromVoxelIndex(index: number, layout: THREE.Vector3): THREE.Vector3 {
  const x = Math.floor(index / (layout.y * layout.z))
  let i = index % (layout.y * layout.z)
  const y = Math.floor(i / layout.z)
  const z = i % layout.z
  return new THREE.Vector3(x, y, z)
}

function toVoxelIndex(pos: THREE.Vector3, layout: THREE.Vector3): number {
  return pos.x * layout.y * layout.z + pos.y * layout.z + pos.z
}


export default class MTGrid extends THREE.Group {

  voxelSize: THREE.Vector3
  voxelLayout: THREE.Vector3
  gridSize: THREE.Vector3
  voxelCount: number
  densities: Array<number>

  level: number

  private readonly geometry: THREE.BoxGeometry | THREE.BoxBufferGeometry
  private material: THREE.MeshBasicMaterial

  constructor(gridSize: THREE.Vector3, voxelSize: THREE.Vector3) {
    super()
    this.gridSize = gridSize.clone()
    this.voxelSize = voxelSize.clone().multiplyScalar(0.7)
    this.voxelLayout = gridSize.clone().divide(voxelSize).round()
    console.log(this.voxelLayout)
    this.voxelCount = this.voxelLayout.x * this.voxelLayout.y * this.voxelLayout.z
    this.geometry = new THREE.BoxBufferGeometry(voxelSize.x, voxelSize.y, voxelSize.z)
    this.material = new THREE.MeshBasicMaterial()
    // this.material.side = THREE.DoubleSide
    // console.log(this.voxelSize)
    // console.log(this.voxelSize.clone().multiplyScalar(0.7))
    for (let i = 0; i < this.voxelLayout.x; i++) {
      for (let j = 0; j < this.voxelLayout.y; j++) {
        for (let k = 0; k < this.voxelLayout.z; k++) {
          // const material = new THREE.MeshBasicMaterial()
          let voxel = new THREE.Mesh(this.geometry, this.material.clone())
          // voxel.scale.copy(this.voxelSize.clone().multiplyScalar(0.7))
          // voxel.scale.copy(this.voxelSize)
          voxel.position.set(
            i - this.voxelLayout.x / 2,
            j - this.voxelLayout.y / 2,
            k - this.voxelLayout.z / 2,
          )
          voxel.position.multiply(voxelSize)
          voxel.rotation.set(0, 0, 0)
          voxel.name = `${i}+${j}+${k}`
          this.add(voxel)
          // this.children.push(voxel)
        }
      }
    }
    const density = new Array<number>(this.voxelCount).fill(0).map(() => {
      return Math.random()
    })
    this.densities = []
    this.setLevel(0.5)
    this.setScatteringDensity(density)
  }

  public setScatteringDensity(scatteringDensity: Array<number>): boolean {
    if (scatteringDensity.length !== this.voxelCount) {
      console.log(`wrong number of voxels, should be ${this.voxelCount}`)
      return false
    } else {
      this.densities = Array.from(scatteringDensity)
      console.log(this.densities)
      this.adjust()
      return true
    }
  }

  public adjust() {
    const max_s = Math.max(...this.densities)
    console.log(max_s)
    for (let i = 0; i < this.densities.length; i++) {
      const x = this.densities[i] / max_s
      this.densities[i] = x
      const voxel = this.children[i] as THREE.Mesh
      const material = voxel.material as THREE.MeshBasicMaterial
      const alpha = MTGrid._calcAlpha(x, this.level)
      const color = MTGrid._calcColor(x)
      material.color.copy(color)
      // console.log(x, alpha, material.color)
      MTGrid._setAlpha(alpha, material)
    }
  }

  // public setGrid(gridSize: Vector3, voxelSize: Vector3) {
  //   // for i in this.children
  //   this.gridSize = gridSize.clone()
  //   this.voxelSize = voxelSize.clone().multiplyScalar(0.7)
  //   this.voxelLayout = gridSize.clone().divide(voxelSize).round()
  //   console.log(this.voxelLayout)
  //   this.voxelCount = this.voxelLayout.x * this.voxelLayout.y * this.voxelLayout.z
  //   this.geometry = new THREE.BoxBufferGeometry(voxelSize.x, voxelSize.y, voxelSize.z)
  //   this.material = new THREE.MeshBasicMaterial()
  //   // this.material.side = THREE.DoubleSide
  //   // console.log(this.voxelSize)
  //   // console.log(this.voxelSize.clone().multiplyScalar(0.7))
  //   for (let i = 0; i < this.voxelLayout.x; i++) {
  //     for (let j = 0; j < this.voxelLayout.y; j++) {
  //       for (let k = 0; k < this.voxelLayout.z; k++) {
  //         // const material = new THREE.MeshBasicMaterial()
  //         let voxel = new THREE.Mesh(this.geometry, this.material.clone())
  //         // voxel.scale.copy(this.voxelSize.clone().multiplyScalar(0.7))
  //         // voxel.scale.copy(this.voxelSize)
  //         voxel.position.set(
  //           i - this.voxelLayout.x / 2,
  //           j - this.voxelLayout.y / 2,
  //           k - this.voxelLayout.z / 2,
  //         )
  //         voxel.position.multiply(voxelSize)
  //         voxel.rotation.set(0, 0, 0)
  //         voxel.name = `${i}+${j}+${k}`
  //         this.add(voxel)
  //         // this.children.push(voxel)
  //       }
  //     }
  //   }
    
  // }

  public setLevel(newLevel: number) {
    this.level = newLevel
    for (let i = 0; i < this.densities.length; i++) {
      const alpha = MTGrid._calcAlpha(this.densities[i], newLevel)
      const voxel = this.children[i] as THREE.Mesh
      const material = voxel.material as THREE.MeshBasicMaterial
      MTGrid._setAlpha(alpha, material)
    }
  }

  private static _setAlpha(alpha: number, material: THREE.MeshBasicMaterial) {
    if (alpha < 0.05) {
      material.visible = false
    } else {
      material.visible = true
    }
    if (alpha > 0.95) {
      material.transparent = false
    } else {
      material.transparent = true
    }
    material.opacity = 1 - alpha
  }

  private static _calcAlpha(x: number, level: number): number {
    if (x < 0.05 || x < level - 0.1) {
      return 0
    } else if (x > 0.95) {
      return 1
    } else {
      const power = 0.5
      return Math.pow(x, power)
    }
  }

  private static _calcColor(x: number): THREE.Color {
    // console.log(`x: ${x}`)
    const color = new THREE.Color()
    color.setHSL(0.0, 2 * x - 1.0, 0.5)
    return color
  }
}
