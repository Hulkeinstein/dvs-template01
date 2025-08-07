# Common Issues & Solutions

## Supabase Issues

### Supabase Warnings
- "@supabase/realtime-js" warnings are normal and can be ignored
- They don't affect functionality

### Course Creation Fails
- Ensure user role is 'instructor' in Supabase
- Check `/api/user/profile` is returning correct format
- Verify RLS policies are properly configured

### Database Connection Issues
- Check environment variables are set correctly
- Ensure Supabase project is not paused
- Verify service role key has proper permissions

## File Upload Issues

### File Upload Fails
- Check file size < 5MB
- Verify file type is image (jpg, png, webp)
- Check Supabase bucket exists and has public access
- Verify bucket permissions in Supabase dashboard

### Base64 Conversion Error
- Ensure file is properly selected before conversion
- Check browser console for specific error messages
- Verify `/app/lib/utils/fileUpload.js` functions

## Lesson Management Issues

### Lesson Reorder Not Working
- Check `@dnd-kit` packages installed
- Verify lesson IDs are unique
- Check order_index values in DB
- Ensure drag handle is properly implemented

### Edit Button Not Working
- Verify course ID is passed correctly
- Check route exists: `/instructor/courses/[id]/edit`
- Verify user owns the course
- Check browser console for routing errors

## Quiz System Issues

### Zod Validation Error (_zod)
- **Problem**: Zod v4.0.14 creates "_zod" property
- **Solution**: Use Zod v3.25.76
- **Check**: `package.json` for correct version

### Quiz Not Showing in Lessons
- Verify `content_type` is set to 'quiz'
- Check topic_id is correctly assigned
- Ensure course_topics table has correct sort_order
- Verify getLessonsByCourseAndTopic query

### Video Placeholder Not Working
- Check videoUtils.js is imported correctly
- Verify Quill editor modules configuration
- Ensure conversion happens before saving
- Check HTML content for placeholder divs

## Authentication Issues

### Google OAuth Not Working
- Verify Google Client ID and Secret
- Check authorized redirect URIs in Google Console
- Ensure NEXTAUTH_URL is set correctly
- Check NextAuth configuration

### Role-based Redirect Issues
- Verify user role in Supabase database
- Check middleware.js for routing logic
- Ensure session includes role information
- Clear browser cookies and re-login

## Styling Issues

### CSS Changes Not Applying
- **NEVER modify CSS files directly**
- Always edit SCSS files in `/public/scss/`
- Import new SCSS in `styles.scss`
- Run build to compile SCSS to CSS

### Bootstrap Conflicts
- Check for conflicting class names
- Verify Bootstrap version (5.x)
- Ensure proper import order
- Check for custom overrides

## Performance Issues

### Slow Page Load
- Check for unnecessary client components
- Verify image optimization (WebP, lazy loading)
- Review bundle size with `npm run analyze`
- Check for memory leaks in useEffect

### Database Query Slow
- Add appropriate indexes in Supabase
- Optimize query with select specific columns
- Use pagination for large datasets
- Consider caching strategies

## GitHub Actions CI Issues

### Prettier Check Fails
- Run `npm run format` locally
- Check `.prettierrc.json` configuration
- Ensure `endOfLine: "auto"` setting
- Verify all files are formatted

### ESLint Errors
- Run `npm run lint` locally
- Fix all errors (not warnings)
- Check for unused variables
- Verify import statements

### Build Fails
- Check for TypeScript errors
- Verify all dependencies installed
- Check environment variables in CI
- Review build logs for specific errors

## Development Environment Issues

### Port 3000 Already in Use
- Check for existing Next.js process
- Kill process: `taskkill /F /IM node.exe` (Windows)
- Or use different port: `npm run dev -- -p 3001`

### Module Not Found Errors
- Run `npm install`
- Delete `node_modules` and reinstall
- Check for typos in import paths
- Verify file extensions (.js vs .jsx)

### Hot Reload Not Working
- Check `.next` folder permissions
- Clear Next.js cache: `rm -rf .next`
- Restart development server
- Check for syntax errors

## Quick Fixes Checklist

1. **Clear all caches**
   ```bash
   rm -rf .next
   rm -rf node_modules
   npm install
   ```

2. **Reset database connection**
   - Restart Supabase project
   - Generate new service role key
   - Update environment variables

3. **Fix formatting issues**
   ```bash
   npm run format
   npm run lint -- --fix
   ```

4. **Verify environment**
   ```bash
   node -v  # Should be 18+
   npm -v   # Should be 9+
   ```