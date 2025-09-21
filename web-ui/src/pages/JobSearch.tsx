import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Button,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Business,
  LocationOn,
  AttachMoney,
  Work,
  Schedule,
  Search,
  BookmarkBorder,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSearchJobsMutation } from '../store/apiSlice';

interface SearchData {
  query: string;
  location: string;
}

export default function JobSearch() {
  const [searchData, setSearchData] = useState<SearchData>({
    query: '',
    location: 'Remote'
  });

  const [searchJobs, { isLoading }] = useSearchJobsMutation();
  const [jobs, setJobs] = useState<any[]>([]);

  const handleSearch = async () => {
    try {
      console.log('🔍 Searching jobs for:', searchData.query, 'in', searchData.location);
      
      const result = await searchJobs({
        query: searchData.query,
        location: searchData.location,
      }).unwrap();
      
      console.log('✅ Job search completed');
      console.log('📊 Full API Response:', result);
      
      const jobsList = result?.data?.jobs || result?.jobs || [];
      console.log('🏢 Jobs extracted:', jobsList);
      setJobs(jobsList);
    } catch (error) {
      console.error('❌ Job search failed:', error);
      setJobs([]);
    }
  };

  const renderJobCard = (job: any, index: number) => (
    <Grid item xs={12} md={6} lg={4} key={job.id || index}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <Card 
          sx={{ 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4,
            },
          }}
        >
          <CardContent sx={{ flexGrow: 1, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                {job.title || 'Job Title'}
              </Typography>
              <IconButton size="small" color="primary">
                <BookmarkBorder />
              </IconButton>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
              <Business sx={{ fontSize: 18, mr: 1 }} />
              <Typography variant="body2">
                {job.company || job.company_name || 'Company Name'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'text.secondary' }}>
              <LocationOn sx={{ fontSize: 18, mr: 1 }} />
              <Typography variant="body2">
                {job.location || 'Remote'}
              </Typography>
            </Box>
            
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              {job.description ? 
                (job.description.length > 150 ? 
                  `${job.description.substring(0, 150)}...` : 
                  job.description
                ) : 
                'Job description will be displayed here...'
              }
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                <AttachMoney sx={{ fontSize: 18, mr: 0.5 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {job.salary || job.salary_range || 'Competitive'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                <Schedule sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="caption">
                  {job.posted_date || job.postedDate || 'Recently posted'}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                fullWidth
                size="small"
                href={job.url || '#'}
                target="_blank"
                sx={{ textTransform: 'none' }}
              >
                View Details
              </Button>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Grid>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
          Job Search
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 4 }}>
          Find your perfect job opportunity
        </Typography>
      </Box>

      {/* Search Form */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="Job Title or Keywords"
              value={searchData.query}
              onChange={(e) => setSearchData({ ...searchData, query: e.target.value })}
              placeholder="e.g., Software Engineer, Data Scientist"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="Location"
              value={searchData.location}
              onChange={(e) => setSearchData({ ...searchData, location: e.target.value })}
              placeholder="e.g., Remote, San Francisco, New York"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSearch}
              disabled={isLoading || !searchData.query.trim()}
              sx={{ height: '56px' }}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ mb: 4 }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
            Searching for jobs...
          </Typography>
        </Box>
      )}

      {/* Results */}
      {!isLoading && jobs.length > 0 && (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Found {jobs.length} job{jobs.length !== 1 ? 's' : ''} matching "{searchData.query}"
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Showing results for {searchData.location}
            </Typography>
          </Paper>
          
          {/* Job Cards Grid */}
          <Grid container spacing={3}>
            {jobs.map((job: any, index: number) => 
              renderJobCard(job, index)
            )}
          </Grid>
        </Box>
      )}

      {/* No Results State */}
      {!isLoading && jobs.length === 0 && searchData.query && searchData.location && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Work sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            No Jobs Found
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
            We couldn't find any jobs matching "{searchData.query}" in {searchData.location}.
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Try adjusting your search terms or location.
          </Typography>
        </Paper>
      )}

      {/* Getting Started State */}
      {!isLoading && jobs.length === 0 && !searchData.query && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Search sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            Start Your Job Search
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
            Enter a job title or keywords above to find opportunities.
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Our AI will help match you with the best positions.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}