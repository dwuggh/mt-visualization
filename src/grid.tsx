import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import MTGrid from './MTGrid'
import { Vector3 } from 'three'
import { useControls } from "leva"

import * as Config from './config.json'


function levaVec3convert(vec: any): Vector3 {
  let x = Math.floor(vec.x)
  if (x <= 0) x = 1 
  let y = Math.floor(vec.y)
  if (y <= 0) y = 1 
  let z = Math.floor(vec.z)
  if (z <= 0) z = 1 
  return new Vector3(x, y, z)
}

export default function Grid({ density }: { density: Array<number> }) {

  const sceneRef = useRef(new THREE.Scene())
  const width = window.innerWidth
  const height = window.innerHeight
  const camera = useRef(new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight,
    0.1, 1000))
  camera.current.position.z = 3


  const size = useControls({
    gridSize: {
      value: Config.gridSize
    },
    voxelSize: {
      value: Config.voxelSize
    }
  })
  const gridSize = levaVec3convert(size.gridSize)
  const voxelSize = levaVec3convert(size.voxelSize)

  const gridRef = useRef(new MTGrid(gridSize, voxelSize))
  gridRef.current.scale.setScalar(2 / gridSize.x)
  sceneRef.current.add(gridRef.current)


  gridRef.current.rotation.x += 0.1
  gridRef.current.rotation.y += 0.41
  // gridRef.current.scale.divide(gridSize.clone())

  useControls({
    level: {
      value: 0.5,
      min: 0,
      max: 1,
      onChange: (v) => {
        gridRef.current.setLevel(v)
      }
    }
  })

  useEffect(() => {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: document.getElementById("canvas") as HTMLCanvasElement
    })
    renderer.setSize(width, height)
    sceneRef.current.background = new THREE.Color(0x00fffff)
    console.log("running")
    const animate = () => {
      requestAnimationFrame(animate)
      renderer.render(sceneRef.current, camera.current)
      gridRef.current.rotation.x += 0.01
    }
    animate()
  })

  useEffect(() => {
    console.log("setting density...")
    console.log(density)
    // density = [0.1, 0.3, 0.4, 0.1, 0, 0, 0.3, 0.8]
    const result = gridRef.current.setScatteringDensity(density)
    console.log(result)
  }, [density])

  return (
    <div>
      <canvas id="canvas" />
    </div>
  )
}
