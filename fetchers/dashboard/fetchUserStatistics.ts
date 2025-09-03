import { supabase } from '../../lib/supabase';

export interface UserStatistics {
  createdCount: number;
  savedCount: number;
  likesReceivedCount: number;
}

export const fetchUserStatistics = async (userId: string): Promise<UserStatistics> => {
  try {
    // Count created outfits
    const { count: createdCount, error: createdError } = await supabase
      .from('created-outfits')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', userId);

    if (createdError) {
      console.error('Error fetching created outfits count:', createdError);
      throw createdError;
    }

    // Count saved outfits
    const { count: savedCount, error: savedError } = await supabase
      .from('saved-outfits')
      .select('*', { count: 'exact', head: true })
      .eq('saved_by', userId);

    if (savedError) {
      console.error('Error fetching saved outfits count:', savedError);
      throw savedError;
    }

    // Count likes received on user's outfits
    // First get all outfit IDs created by the user, then count positive ratings on those outfits
    const { data: userOutfits, error: userOutfitsError } = await supabase
      .from('created-outfits')
      .select('outfit_id')
      .eq('created_by', userId);

    if (userOutfitsError) {
      console.error('Error fetching user outfits for likes count:', userOutfitsError);
      throw userOutfitsError;
    }

    let likesReceivedCount = 0;
    if (userOutfits && userOutfits.length > 0) {
      const outfitIds = userOutfits.map(outfit => outfit.outfit_id);
      
      const { count: likesCount, error: likesError } = await supabase
        .from('outfits-rating')
        .select('*', { count: 'exact', head: true })
        .in('outfit_id', outfitIds)
        .eq('top_rated', true);

      if (likesError) {
        console.error('Error fetching likes count:', likesError);
        throw likesError;
      }

      likesReceivedCount = likesCount || 0;
    }

    return {
      createdCount: createdCount || 0,
      savedCount: savedCount || 0,
      likesReceivedCount,
    };
  } catch (error) {
    console.error('Error in fetchUserStatistics:', error);
    throw error;
  }
};
