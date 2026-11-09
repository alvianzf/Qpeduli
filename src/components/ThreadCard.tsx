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

export default function ThreadCard({ thread, index = 0 }: { thread: Thread; index?: number }) {
  const navigate = useNavigate();
  const author = users[thread.authorId];
  const category = categoryCache[thread.categoryId];

  return (
    <GlossCard onClick={() => navigate(`/thread/${thread.id}`)} delay={Math.min(index, 4) * 0.05}>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Avatar sx={{ bgcolor: author?.avatarColor, width: 44, height: 44, fontWeight: 700 }}>{author?.avatarInitial}</Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ minHeight: 24 }}>
            <Typography variant="subtitle2" noWrap>{author?.name}</Typography>
            {author?.isKsatria && <VerifiedBadge size={15} />}
            <Typography variant="caption" color="text.secondary" noWrap>· {timeAgo(thread.createdAt)}</Typography>
            {thread.hot && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <LocalFireDepartmentIcon sx={{ fontSize: 15, color: 'warning.main' }} />
                <Typography variant="caption" fontWeight={700} color="warning.main">Trending</Typography>
              </Stack>
            )}
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ my: 1.5 }} flexWrap="wrap" useFlexGap>
            {category && <Chip label={category.name} size="small" variant="outlined" />}
            {thread.isAksiSosial && (
              <Chip icon={<VolunteerActivismIcon />} label="Aksi Sosial" size="small" color="primary" />
            )}
          </Stack>

          <Typography variant="h6" sx={{ fontSize: '1.1rem', mb: 0.75 }}>{thread.title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {thread.content}
          </Typography>

          {thread.isAksiSosial && thread.campaign && (
            <Box sx={{ mt: 2.5, maxWidth: 440 }}>
              <CampaignProgress campaign={thread.campaign} compact />
            </Box>
          )}

          <Stack direction="row" spacing={3} sx={{ mt: 2.5 }}>
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
      </Stack>
    </GlossCard>
  );
}
