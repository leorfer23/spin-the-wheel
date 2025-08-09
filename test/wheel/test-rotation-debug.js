// Test rotation logic manually

function testRotation(selectedIndex, totalSegments, rotations) {
  const segmentAngle = 360 / totalSegments;
  const segmentOffset = -segmentAngle / 2;
  
  console.log(`\n=== Testing: Select segment ${selectedIndex} from ${totalSegments} segments ===`);
  console.log(`Segment angle: ${segmentAngle}°, Offset: ${segmentOffset}°`);
  
  // Where does each segment start (with offset)?
  console.log('\nSegment starting positions (with offset):');
  for (let i = 0; i < totalSegments; i++) {
    const startAngle = i * segmentAngle + segmentOffset;
    const endAngle = startAngle + segmentAngle;
    console.log(`  Segment ${i}: ${startAngle}° to ${endAngle}° (center: ${startAngle + segmentAngle/2}°)`);
  }
  
  // Calculate target rotation
  // Option 1: Subtract (rotate backwards)
  const targetRotation1 = (rotations * 360) - (selectedIndex * segmentAngle);
  
  // Option 2: Add (rotate forwards)  
  const targetRotation2 = (rotations * 360) + (selectedIndex * segmentAngle);
  
  console.log(`\nTarget rotations:`);
  console.log(`  Option 1 (subtract): ${targetRotation1}°`);
  console.log(`  Option 2 (add): ${targetRotation2}°`);
  
  // Check which segment ends up at top for each option
  function getSegmentAtTop(rotation) {
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    let minDistance = 360;
    let segmentAtTop = 0;
    
    for (let i = 0; i < totalSegments; i++) {
      const startAngle = i * segmentAngle + segmentOffset;
      const centerAngle = startAngle + segmentAngle / 2;
      // When wheel rotates, segments move with it
      const currentAngle = (centerAngle + normalizedRotation + 360) % 360;
      const distanceFromTop = Math.min(currentAngle, 360 - currentAngle);
      
      if (distanceFromTop < minDistance) {
        minDistance = distanceFromTop;
        segmentAtTop = i;
      }
    }
    
    return segmentAtTop;
  }
  
  console.log('\nResults:');
  console.log(`  Option 1 winner: Segment ${getSegmentAtTop(targetRotation1)}`);
  console.log(`  Option 2 winner: Segment ${getSegmentAtTop(targetRotation2)}`);
  console.log(`  Expected: Segment ${selectedIndex}`);
}

// Test cases
testRotation(0, 6, 3); // Select segment 0 from 6 segments
testRotation(1, 6, 3); // Select segment 1 from 6 segments
testRotation(2, 6, 3); // Select segment 2 from 6 segments
testRotation(3, 6, 3); // Select segment 3 from 6 segments
testRotation(4, 6, 3); // Select segment 4 from 6 segments
testRotation(5, 6, 3); // Select segment 5 from 6 segments