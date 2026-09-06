import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Stack from './ui/FlexStack';
import Avatar from '@mui/material/Avatar';
import Typography from './ui/Txt';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import type { Thread } from '../types';
import { timeAgo } from '../data/mockData';
import { userCache as users, categoryCache } from '../lib/adapters';
import VerifiedBadge from './VerifiedBadge';
import CampaignProgress from './CampaignProgress';

export default function ThreadCard({ thread, index = 0 }: { thread: Thread; index?: number }) {
  const navigate = useNavigate();
  const author = users[thread.authorId];
  const category = categoryCache[thread.categoryId];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
    >
      <Card
        sx={{
          overflow: 'hidden',
          borderLeft: category ? `3px solid ${category.color}` : undefined,
          transition: 'box-shadow .2s ease, transform .2s ease',
          '&:hover': { boxShadow: '0 6px 20px rgba(22,35,63,0.08)' },
        }}
      >
        <CardActionArea onClick={() => navigate(`/thread/${thread.id}`)}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
            <Stack direction="row" spacing={1.5}>
              <Avatar sx={{ bgcolor: author.avatarColor, width: 42, height: 42, fontWeight: 700, flexShrink: 0 }}>
                {author.avatarInitial}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ rowGap: 0.5 }}>
                  <Typography variant="subtitle2" fontWeight={700} noWrap>
                    {author.name}
                  </Typography>
                  {author.isKsatria && <VerifiedBadge size={15} />}
                  <Typography variant="caption" color="text.secondary">· {timeAgo(thread.createdAt)}</Typography>
                  {thread.hot && (
                    <Stack direction="row" spacing={0.25} alignItems="center" sx={{ ml: 0.5 }}>
                      <LocalFireDepartmentIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                      <Typography variant="caption" fontWeight={700} color="warning.main">Trending</Typography>
                    </Stack>
                  )}
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.75, mb: 0.75 }} flexWrap="wrap" useFlexGap>
                  {category && (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: category.color }} />
                      <Typography variant="caption" fontWeight={600} sx={{ color: category.color }}>
                        {category.name}
                      </Typography>
                    </Stack>
                  )}
                  {thread.isAksiSosial && (
                    <Chip
                      icon={<VolunteerActivismIcon sx={{ fontSize: '14px !important' }} />}
                      label="Aksi Sosial"
                      size="small"
                      color="primary"
                    />
                  )}
                </Stack>

                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 0.5 }}>
                  {thread.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {thread.content}
                </Typography>

                {thread.isAksiSosial && thread.campaign && (
                  <Box sx={{ mt: 1.5, maxWidth: 420 }}>
                    <CampaignProgress campaign={thread.campaign} compact />
                  </Box>
                )}

                <Stack direction="row" spacing={2.5} sx={{ mt: 1.5 }}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <ChatBubbleOutlineIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                    <Typography variant="caption" color="text.secondary">{thread.comments.length} komentar</Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <VisibilityOutlinedIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                    <Typography variant="caption" color="text.secondary">{thread.views.toLocaleString('id-ID')} dilihat</Typography>
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </CardActionArea>
      </Card>
    </motion.div>
  );
}
