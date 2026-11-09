import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import { useNavigate } from 'react-router-dom';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import type { Thread } from '../types';
import { timeAgo } from '../data/mockData';
import { userCache as users, categoryCache } from '../lib/adapters';
import GlossCard from './ui/GlossCard';
import Stack from './ui/FlexStack';
import Typography from './ui/Txt';
import VerifiedBadge from './VerifiedBadge';
import CampaignProgress from './CampaignProgress';

/** Dense feed row: title first, meta line under it, stats and progress on the right on wide screens. */
export default function ThreadCard({ thread, index = 0 }: { thread: Thread; index?: number }) {
  const navigate = useNavigate();
  const author = users[thread.authorId];
  const category = categoryCache[thread.categoryId];
  const aksi = thread.isAksiSosial && thread.campaign;

  return (
    <GlossCard onClick={() => navigate(`/thread/${thread.id}`)} delay={Math.min(index, 4) * 0.05} sx={{ p: 2 }}>
      <Box sx={{ display: 'grid', gap: 2, alignItems: 'center', gridTemplateColumns: { xs: '1fr', md: aksi ? 'minmax(0,1fr) 220px' : '1fr' } }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ minWidth: 0 }}>
          <Avatar sx={{ bgcolor: author?.avatarColor, width: 36, height: 36, fontSize: 15, fontWeight: 700 }}>{author?.avatarInitial}</Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              {thread.hot && <LocalFireDepartmentIcon sx={{ fontSize: 16, color: 'warning.main' }} />}
              {thread.isAksiSosial && <Chip icon={<VolunteerActivismIcon />} label="Aksi" size="small" color="primary" />}
              {category && <Chip label={category.name} size="small" variant="outlined" />}
            </Stack>
            <Typography variant="h6" sx={{ fontSize: '1rem', lineHeight: 1.3, mt: 0.75 }}>{thread.title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {thread.content}
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary" noWrap>{author?.name}</Typography>
              {author?.isKsatria && <VerifiedBadge size={14} />}
              <Typography variant="caption" color="text.secondary">{timeAgo(thread.createdAt)}</Typography>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <ChatBubbleOutlineIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                <Typography variant="caption" color="text.secondary">{thread.comments.length}</Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <VisibilityOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                <Typography variant="caption" color="text.secondary">{thread.views.toLocaleString('id-ID')}</Typography>
              </Stack>
            </Stack>
          </Box>
        </Stack>
        {aksi && thread.campaign && <CampaignProgress campaign={thread.campaign} compact />}
      </Box>
    </GlossCard>
  );
}
