await supabase
  .from('ab_tests')
  .update({ winner: 'A' })
  .eq('test_id', testId);
