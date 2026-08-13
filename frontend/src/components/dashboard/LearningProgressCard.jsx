import React from 'react';
import { useActiveRoadmap } from '../../hooks/useActiveRoadmap';
import { RoadmapProgressCard } from '../roadmap/RoadmapProgressCard';

export const LearningProgressCard = () => {
  const { roadmap, tasks, progress } = useActiveRoadmap();

  return (
    <RoadmapProgressCard
      roadmap={roadmap}
      tasks={tasks}
      progress={progress}
    />
  );
};

export default LearningProgressCard;
