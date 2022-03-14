import { Chip, Grid, Skeleton, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ISmallCard } from '../../interfaces';
import { FFBackgroundHover } from '../../theme';

type Props = {
  card: ISmallCard;
};

export const SmallCard: React.FC<Props> = ({ card }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <Box
      key={card.header}
      p={2}
      borderRadius={1}
      sx={{
        width: '100%',
        height: '100%',
        backgroundColor: 'background.paper',
        '&:hover': card.clickPath && {
          backgroundColor: FFBackgroundHover,
          cursor: 'pointer',
        },
      }}
      onClick={() => (card.clickPath ? navigate(card.clickPath) : undefined)}
    >
      <Grid
        container
        alignItems="flex-end"
        justifyContent="space-between"
        direction="row"
        sx={{ paddingBottom: 1 }}
      >
        <Grid item>
          <Typography
            sx={{
              fontWeight: 'bold',
            }}
          >
            {card.header}
          </Typography>
        </Grid>
        {card.numErrors && card.numErrors > 0 ? (
          <Grid item>
            <Chip
              label={`${card.numErrors} ${t('failed')}`}
              color="error"
              size="small"
              sx={{ fontSize: 10, fontWeight: 'bold' }}
            />
          </Grid>
        ) : (
          <></>
        )}
      </Grid>
      <Grid
        container
        alignItems="flex-end"
        justifyContent={card.data.length > 1 ? 'space-evenly' : 'flex-start'}
        direction="row"
      >
        {card.data.map((data, idx) => {
          return (
            <Grid key={idx} item>
              <Typography
                sx={{ fontSize: 12, textTransform: 'uppercase' }}
                variant="subtitle2"
              >
                {data.header}
              </Typography>

              {data.data !== undefined ? (
                <Typography
                  sx={{ fontSize: 24, fontWeight: 'bold' }}
                  variant="subtitle1"
                >
                  {data.data}
                </Typography>
              ) : (
                <Skeleton sx={{ width: 40, height: 42 }} />
              )}
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};
