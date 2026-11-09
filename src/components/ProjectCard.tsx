import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import PlaceIcon from '@mui/icons-material/Place';
import { useNavigate } from 'react-router-dom';
import type { ModalUsaha } from '../types';
import { userCache } from '../lib/adapters';
import GlossCard from './ui/GlossCard';
import Stack from './ui/FlexStack';
import Typography from './ui/Txt';
import ProjectArt from './ProjectArt';
import CampaignProgress from './CampaignProgress';

/** Kickstarter-style card: tall cover, tags, title, owner, short story, progress pinned to the bottom. */
export default function ProjectCard({ project, index = 0 }: { project: ModalUsaha; index?: number }) {
  const navigate = useNavigate();
  const owner = userCache[project.ownerId];
  return (
    <GlossCard flush onClick={() => navigate(`/modal-usaha/${project.id}`)} delay={(index % 3) * 0.08}>
      <ProjectArt seed={project.id} height={200} />
      <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ minHeight: 28 }}>
          {project.businessType && <Chip label={project.businessType} size="small" color="primary" variant="outlined" />}
          {project.city && <Chip icon={<PlaceIcon />} label={project.city} size="small" />}
        </Stack>
        <Typography variant="h6" sx={{ fontSize: '1.2rem', lineHeight: 1.3 }}>{project.title}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ minHeight: 20 }}>{owner ? `oleh ${owner.name}` : ''}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {project.story}
        </Typography>
        <Box sx={{ mt: 'auto', pt: 1.5 }}>
          <CampaignProgress campaign={project.campaign} compact />
        </Box>
      </Box>
    </GlossCard>
  );
}
