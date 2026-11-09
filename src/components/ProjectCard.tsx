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

/** Modal Usaha card, horizontal: cover on the left, details on the right, progress pinned to the bottom. */
export default function ProjectCard({ project, index = 0 }: { project: ModalUsaha; index?: number }) {
  const navigate = useNavigate();
  const owner = userCache[project.ownerId];
  return (
    <GlossCard flush onClick={() => navigate(`/modal-usaha/${project.id}`)} delay={(index % 2) * 0.08} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
      <Box sx={{ width: { xs: '100%', sm: 150 }, flexShrink: 0, display: 'flex', '& > *': { flex: 1 } }}>
        <ProjectArt seed={project.id} height={150} />
      </Box>
      <Box sx={{ p: 2, flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ minHeight: 24 }}>
          {project.businessType && <Chip label={project.businessType} size="small" color="primary" variant="outlined" />}
          {project.city && <Chip icon={<PlaceIcon />} label={project.city} size="small" />}
        </Stack>
        <Typography variant="h6" sx={{ fontSize: '1rem', lineHeight: 1.3 }}>{project.title}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ minHeight: 18 }}>{owner ? `oleh ${owner.name}` : ''}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {project.story}
        </Typography>
        <Box sx={{ mt: 'auto', pt: 1 }}>
          <CampaignProgress campaign={project.campaign} compact />
        </Box>
      </Box>
    </GlossCard>
  );
}
