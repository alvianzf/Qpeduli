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

/** Feed card: author line, tags, title, excerpt, optional progress, stats pinned to the bottom. */
export default function ThreadCard({ thread, index = 0 }: { thread: Thread; index?: number }) {
  const navigate = useNavigate();
  const author = users[thread.authorId];
  const category = categoryCache[thread.categoryId];

  return (
    <GlossCard onClick={() => navigate(`/thread/${thread.id}`)} delay={Math.min(index, 4) * 0.05} sx={{ gap: 1.5 }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar sx={{ bgcolor: author?.avatarColor, width: 40, height: 40, fontWeight: 700 }}>{author?.avatarInitial}</Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Typography variant="subtitle2" noWrap>{author?.name}</Typography>
            {author?.isKsatria && <VerifiedBadge size={15} />}
          </Stack>
          <Typography variant="caption" color="text.secondary">{timeAgo(thread.createdAt)}</Typography>
        </Box>
        {thread.hot && <LocalFireDepartmentIcon sx={{ color: 'warning.main' }} />}
      </Stack>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ minHeight: 28 }}>
        {category && <Chip label={category.name} size="small" variant="outlined" />}
        {thread.isAksiSosial && <Chip icon={<VolunteerActivismIcon />} label="Aksi" size="small" color="primary" />}
      </Stack>
      <Typography variant="h6" sx={{ fontSize: '1.15rem', lineHeight: 1.3 }}>{thread.title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {thread.content}
      </Typography>
      <Box sx={{ mt: 'auto', pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {thread.isAksiSosial && thread.campaign && <CampaignProgress campaign={thread.campaign} compact />}
        <Stack direction="row" spacing={3}>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <ChatBubbleOutlineIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.secondary">{thread.comments.length}</Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <VisibilityOutlinedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.secondary">{thread.views.toLocaleString('id-ID')}</Typography>
          </Stack>
        </Stack>
      </Box>
    </GlossCard>
  );
}
