import React, { useState, useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Line, OrbitControls, Sky, useGLTF } from "@react-three/drei";
import "../assets/styles/simulation.scss";
import * as THREE from "three";
import useStore from "../../utils/store";
import Select from "react-select";
import axios from "axios";
import FullPageLoader from "../../components/FullPageLoader"; // FullPageLoader bileşenini dahil edin
import EnvMap from "../assets/textures/envmap.hdr"

function Simulation() {
  const {
    telemetryData,
    setTelemetryData,
    selectedYear,
    setSelectedYear,
    drivers,
    setDrivers,
    selectedDriver,
    setSelectedDriver,
    laps,
    setLaps,
    selectedLap,
    setSelectedLap,
    isDriverSelectDisabled,
    setIsDriverSelectDisabled,
    isLapSelectDisabled,
    setIsLapSelectDisabled,
    loading,
    setLoading,
  } = useStore();

  const [cameraMode, setCameraMode] = useState("free");
  const modelRef = useRef();

  const points = useMemo(() => telemetryData?.map((p) => new THREE.Vector3(p[0], p[1], p[2])), [telemetryData]);

  const years = [
    { value: 2018, label: 2018 },
    { value: 2019, label: 2019 },
    { value: 2020, label: 2020 },
    { value: 2021, label: 2021 },
    { value: 2022, label: 2022 },
    { value: 2023, label: 2023 },
  ];

  useEffect(() => {
    if (selectedYear) {
      setLoading(true);
      axios
        .get(`http://localhost:8000/drivers/${selectedYear.value}`)
        .then((response) => {
          const driverOptions = response.data.map((driver) => ({ value: driver, label: driver }));
          setDrivers(driverOptions);
          setSelectedDriver(null);
          setSelectedLap(null);
          setIsDriverSelectDisabled(false);
          setIsLapSelectDisabled(true);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching drivers:", error);
          setIsDriverSelectDisabled(true);
          setIsLapSelectDisabled(true);
          setLoading(false);
        });
    } else {
      setDrivers([]);
      setSelectedDriver(null);
      setLaps([]);
      setSelectedLap(null);
      setIsDriverSelectDisabled(true);
      setIsLapSelectDisabled(true);
    }
  }, [selectedYear, setDrivers, setIsDriverSelectDisabled, setIsLapSelectDisabled, setLaps, setLoading, setSelectedDriver, setSelectedLap]);

  useEffect(() => {
    if (selectedYear && selectedDriver) {
      setLoading(true);
      axios
        .get(`http://localhost:8000/laps/${selectedYear.value}/${selectedDriver.value}`)
        .then((response) => {
          const lapOptions = response.data.map((lap) => ({ value: lap, label: `Lap ${lap}` }));
          setLaps(lapOptions);
          setSelectedLap(null);
          setIsLapSelectDisabled(false);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching laps:", error);
          setIsLapSelectDisabled(true);
          setLoading(false);
        });
    } else {
      setLaps([]);
      setSelectedLap(null);
      setIsLapSelectDisabled(true);
    }
  }, [selectedDriver, selectedYear, setIsLapSelectDisabled, setLaps, setLoading, setSelectedLap]);

  useEffect(() => {
    if (selectedYear && selectedDriver && selectedLap) {
      setLoading(true);
      axios
        .get(`http://localhost:8000/telemetry/${selectedYear.value}/${selectedDriver.value}/${selectedLap.value}`)
        .then((response) => {
          setTelemetryData(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching telemetry data:", error);
          setLoading(false);
        });
    }
  }, [selectedYear, selectedDriver, selectedLap, setTelemetryData, setLoading]);

  function MovingCar({ path, duration }) {
    const carRef = useRef();
    const elapsedTimeRef = useRef(0);
  
    const rotationAngleDegrees = 75;
    const rotationAngleRadians = rotationAngleDegrees * (Math.PI / 180);
    const rotationMatrix = new THREE.Matrix4().makeRotationY(rotationAngleRadians);
  
    const points = useMemo(
      () =>
        path.map((p) => {
          const vector = new THREE.Vector3(p.x - 47.5, p.y + 0, -p.z + 19.5);
          vector.applyMatrix4(rotationMatrix);
          return new THREE.Vector3(vector.x, vector.y, vector.z);
        }),
      [path]
    );
  
    const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
    const spacedPoints = useMemo(() => curve.getSpacedPoints(5000), [curve]);
  
    useFrame((state, delta) => {
      elapsedTimeRef.current += delta;
  
      const t = (elapsedTimeRef.current % duration) / duration;
      const index = Math.floor(t * (spacedPoints.length - 1));
      const pointOnCurve = spacedPoints[index];
      const nextPointOnCurve = spacedPoints[(index + 1) % spacedPoints.length];
  
      carRef.current.position.copy(pointOnCurve);
  
      const forwardDirection = new THREE.Vector3().subVectors(nextPointOnCurve, pointOnCurve).normalize();
      const lookAtQuaternion = new THREE.Quaternion();
      lookAtQuaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), forwardDirection);
      carRef.current.quaternion.slerp(lookAtQuaternion, 0.1);
  
      // Tekerlek dönüşü için hesaplama
      const wheelRotationSpeed = 10; // Tekerleklerin ne kadar hızlı döneceğini belirleyin
      const wheelRotation = delta * wheelRotationSpeed;
  
      const frontRightWheel = carRef.current.getObjectByName("Front_Right");
      const frontLeftWheel = carRef.current.getObjectByName("Front_Left");
      const backRightWheel = carRef.current.getObjectByName("Back_Right");
      const backLeftWheel = carRef.current.getObjectByName("Back_Left");
  
      if (frontRightWheel) {
        frontRightWheel.rotateX(wheelRotation);
      }
  
      if (frontLeftWheel) {
        frontLeftWheel.rotateX(wheelRotation);
      }
  
      if (backRightWheel) {
        backRightWheel.rotateX(wheelRotation);
      }
  
      if (backLeftWheel) {
        backLeftWheel.rotateX(wheelRotation);
      }
  
      if (cameraMode === "follow" && carRef.current) {
        const cameraPosition = new THREE.Vector3().copy(carRef.current.position);
        cameraPosition.y += 10;
        cameraPosition.z -= 20;
        state.camera.position.copy(cameraPosition);
        state.camera.lookAt(carRef.current.position);
      }
    });
  
    const gltf = useGLTF("/assets/simplecar.glb", true);
  
    return <primitive ref={carRef} object={gltf.scene} scale={0.5} />;
  }
  function RaceTrackModel() {
    const gltf = useGLTF("/assets/track.glb", true);
    gltf.scene.scale.set(0.25, 0.25, 0.25);

    return <primitive ref={modelRef} object={gltf.scene} />;
  }

  function Ground() {
    return (
      <mesh position={[0, -50.5, 0]} receiveShadow>
        <boxGeometry attach="geometry" args={[1000, 100, 1000]} />
        <meshStandardMaterial attach="material" color="#5C875A" flatShading roughness={1} metalness={0} />
      </mesh>
    );
  }

  const RaceTrack = ({ points }) => {
    const lineRef = useRef();

    const rotationAngleDegrees = 74;
    const rotationAngleRadians = rotationAngleDegrees * (Math.PI / 180);

    const rotationMatrix = new THREE.Matrix4();
    rotationMatrix.makeRotationY(rotationAngleRadians);

    const rotatedVertices = useMemo(
      () =>
        points.map((p) => {
          const vector = new THREE.Vector3(p.x - 47.5, p.y + 1, -p.z + 19.5);
          vector.applyMatrix4(rotationMatrix);
          return vector;
        }),
      [points, rotationMatrix],
    );

    return <Line ref={lineRef} points={rotatedVertices} color={"red"} lineWidth={5} />;
  };

  return (
    <div className="homepage">
      {loading && <FullPageLoader />}
      <div className="controls">
        <button onClick={() => setCameraMode("free")}>Free Camera</button>
        <button onClick={() => setCameraMode("follow")}>Follow Camera</button>
        <Select
          className="select-box"
          classNamePrefix="select"
          options={years}
          placeholder="Select Year"
          onChange={setSelectedYear}
          value={selectedYear}
        />
        <Select
          className="select-box"
          classNamePrefix="select"
          options={drivers}
          placeholder="Select Driver"
          onChange={setSelectedDriver}
          isDisabled={isDriverSelectDisabled}
          value={selectedDriver}
        />
        <Select
          className="select-box"
          classNamePrefix="select"
          options={laps}
          placeholder="Select Lap"
          onChange={setSelectedLap}
          isDisabled={isLapSelectDisabled}
          value={selectedLap}
        />
      </div>
      <Canvas camera={{ position: [0, 300, 0], fov: 50 }}>
        <Environment files={EnvMap} background={"both"}/>

        <ambientLight intensity={2} />
        <OrbitControls enabled={cameraMode === "free"} />
        <axesHelper args={[20]} />

        {telemetryData && <MovingCar path={points} duration={30} />}

        {/* <Sky sunPosition={[100, 10, 100]} turbidity={10} rayleigh={2} /> */}
        <RaceTrackModel />
        <Ground />
      </Canvas>
    </div>
  );
}

export default Simulation;
