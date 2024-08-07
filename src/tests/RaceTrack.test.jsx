import { describe, it, expect, vi } from 'vitest';
import { create , act} from '@react-three/test-renderer';
import { useGLTF } from '@react-three/drei';
import RaceTrack from '../components/RaceTrack';

vi.mock('@react-three/drei', () => ({
  useGLTF: vi.fn(),
}));

describe('RaceTrack component', () => {
  it('should render and load the GLTF model correctly', async () => {
    const mockGLTF = {
      scene: {
        scale: { set: vi.fn() },
        traverse: vi.fn((callback) => {
          callback({ isMesh: true, receiveShadow: true, castShadow: true, name: 'track' });
          callback({ isMesh: true, receiveShadow: true, castShadow: true, name: 'terrain' });
        }),
      },
    };

    useGLTF.mockReturnValue(mockGLTF);

    let component;
    await act(async () => {
      component = await create(<RaceTrack />);
    });

    expect(useGLTF).toHaveBeenCalledWith('/assets/track.glb', true);
    
    expect(mockGLTF.scene.scale.set).toHaveBeenCalledWith(0.25, 0.25, 0.25);
    
    expect(mockGLTF.scene.traverse).toHaveBeenCalled();
    
    mockGLTF.scene.traverse((node) => {
      if (node.isMesh) {
        expect(node.receiveShadow).toBe(true);
        
        if (node.name !== 'terrain') {
          expect(node.castShadow).toBe(true);
        }
      }
    });

    expect(component).toBeDefined();
  });

  it('should correctly handle different node configurations', async () => {
    const mockGLTF = {
      scene: {
        scale: { set: vi.fn() },
        traverse: vi.fn((callback) => {
          callback({ isMesh: true, receiveShadow: false, castShadow: false, name: 'testNode' });
        }),
      },
    };

    useGLTF.mockReturnValue(mockGLTF);

    let component;
    await act(async () => {
      component = await create(<RaceTrack />);
    });

    expect(useGLTF).toHaveBeenCalledWith('/assets/track.glb', true);
    
    expect(mockGLTF.scene.scale.set).toHaveBeenCalledWith(0.25, 0.25, 0.25);
    
    expect(mockGLTF.scene.traverse).toHaveBeenCalled();
    
    mockGLTF.scene.traverse((node) => {
      if (node.isMesh) {
        expect(node.receiveShadow).toBe(false);
        
        expect(node.castShadow).toBe(false);
      }
    });

    expect(component).toBeDefined();
  });
});
