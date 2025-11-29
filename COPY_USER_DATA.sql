-- SQL Script to Copy User Data
-- FROM: syamimisuhaidi@gmail.com
-- TO: sasuhai@yahoo.com
-- 
-- This script copies all portfolio data while preserving the target user's
-- username, email, and password credentials.

-- ============================================================================
-- STEP 1: Get User IDs and Copy Data
-- ============================================================================

DO $$
DECLARE
    source_user_id UUID;
    target_user_id UUID;
    target_username TEXT;
    target_email TEXT;
BEGIN
    -- Get source user ID
    SELECT user_id INTO source_user_id
    FROM profile_info
    WHERE email = 'syamimisuhaidi@gmail.com';

    -- Get target user ID and preserve credentials
    SELECT user_id, username, email INTO target_user_id, target_username, target_email
    FROM profile_info
    WHERE email = 'sasuhai@yahoo.com';

    -- Verify both users exist
    IF source_user_id IS NULL THEN
        RAISE EXCEPTION 'Source user (syamimisuhaidi@gmail.com) not found';
    END IF;

    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'Target user (sasuhai@yahoo.com) not found';
    END IF;

    RAISE NOTICE 'Source User ID: %', source_user_id;
    RAISE NOTICE 'Target User ID: %', target_user_id;

    -- ============================================================================
    -- STEP 2: Copy Profile Data (excluding username, email, password)
    -- ============================================================================
    
    UPDATE profile_info
    SET
        full_name = (SELECT full_name FROM profile_info WHERE user_id = source_user_id),
        tagline = (SELECT tagline FROM profile_info WHERE user_id = source_user_id),
        bio = (SELECT bio FROM profile_info WHERE user_id = source_user_id),
        about = (SELECT about FROM profile_info WHERE user_id = source_user_id),
        phone = (SELECT phone FROM profile_info WHERE user_id = source_user_id),
        location = (SELECT location FROM profile_info WHERE user_id = source_user_id),
        languages = (SELECT languages FROM profile_info WHERE user_id = source_user_id),
        github_url = (SELECT github_url FROM profile_info WHERE user_id = source_user_id),
        linkedin_url = (SELECT linkedin_url FROM profile_info WHERE user_id = source_user_id),
        twitter_url = (SELECT twitter_url FROM profile_info WHERE user_id = source_user_id),
        profile_image_url = (SELECT profile_image_url FROM profile_info WHERE user_id = source_user_id),
        show_photo_frame = (SELECT show_photo_frame FROM profile_info WHERE user_id = source_user_id),
        status = (SELECT status FROM profile_info WHERE user_id = source_user_id),
        theme_color = (SELECT theme_color FROM profile_info WHERE user_id = source_user_id),
        role = (SELECT role FROM profile_info WHERE user_id = source_user_id)
        -- Note: username, email, and must_change_password are NOT copied
    WHERE user_id = target_user_id;

    RAISE NOTICE 'Profile data copied successfully';

    -- ============================================================================
    -- STEP 3: Copy About Features
    -- ============================================================================
    
    -- Delete existing features for target user
    DELETE FROM about_features WHERE user_id = target_user_id;

    -- Copy features from source to target
    INSERT INTO about_features (user_id, icon, label, description, display_order)
    SELECT 
        target_user_id,
        icon,
        label,
        description,
        display_order
    FROM about_features
    WHERE user_id = source_user_id;

    RAISE NOTICE 'About features copied: % rows', (SELECT COUNT(*) FROM about_features WHERE user_id = target_user_id);

    -- ============================================================================
    -- STEP 4: Copy Skills
    -- ============================================================================
    
    -- Delete existing skills for target user
    DELETE FROM skills WHERE user_id = target_user_id;

    -- Copy skills from source to target
    INSERT INTO skills (user_id, name, category, level)
    SELECT 
        target_user_id,
        name,
        category,
        level
    FROM skills
    WHERE user_id = source_user_id;

    RAISE NOTICE 'Skills copied: % rows', (SELECT COUNT(*) FROM skills WHERE user_id = target_user_id);

    -- ============================================================================
    -- STEP 5: Copy Education
    -- ============================================================================
    
    -- Delete existing education for target user
    DELETE FROM education WHERE user_id = target_user_id;

    -- Copy education from source to target
    INSERT INTO education (user_id, degree, institution, field_of_study, start_date, end_date, location, description, achievements)
    SELECT 
        target_user_id,
        degree,
        institution,
        field_of_study,
        start_date,
        end_date,
        location,
        description,
        achievements
    FROM education
    WHERE user_id = source_user_id;

    RAISE NOTICE 'Education copied: % rows', (SELECT COUNT(*) FROM education WHERE user_id = target_user_id);

    -- ============================================================================
    -- STEP 6: Copy Work Experience
    -- ============================================================================
    
    -- Delete existing work experience for target user
    DELETE FROM work_experience WHERE user_id = target_user_id;

    -- Copy work experience from source to target
    INSERT INTO work_experience (user_id, position, company, location, start_date, end_date, description, achievements, skills)
    SELECT 
        target_user_id,
        position,
        company,
        location,
        start_date,
        end_date,
        description,
        achievements,
        skills
    FROM work_experience
    WHERE user_id = source_user_id;

    RAISE NOTICE 'Work experience copied: % rows', (SELECT COUNT(*) FROM work_experience WHERE user_id = target_user_id);

    -- ============================================================================
    -- STEP 7: Copy Certifications
    -- ============================================================================
    
    -- Delete existing certifications for target user
    DELETE FROM certifications WHERE user_id = target_user_id;

    -- Copy certifications from source to target
    INSERT INTO certifications (user_id, name, issuer, issue_date, expiry_date, credential_id, credential_url)
    SELECT 
        target_user_id,
        name,
        issuer,
        issue_date,
        expiry_date,
        credential_id,
        credential_url
    FROM certifications
    WHERE user_id = source_user_id;

    RAISE NOTICE 'Certifications copied: % rows', (SELECT COUNT(*) FROM certifications WHERE user_id = target_user_id);

    -- ============================================================================
    -- STEP 8: Copy Projects
    -- ============================================================================
    
    -- Delete existing projects for target user
    DELETE FROM projects WHERE user_id = target_user_id;

    -- Copy projects from source to target
    INSERT INTO projects (
        user_id, title, description, image_url, demo_url, github_url, 
        technologies, category, published
    )
    SELECT 
        target_user_id,
        title,
        description,
        image_url,
        demo_url,
        github_url,
        technologies,
        category,
        published
    FROM projects
    WHERE user_id = source_user_id;

    RAISE NOTICE 'Projects copied: % rows', (SELECT COUNT(*) FROM projects WHERE user_id = target_user_id);

    -- ============================================================================
    -- STEP 9: Copy Custom Resume Sections (if table exists)
    -- ============================================================================
    
    -- Check if custom_resume_sections table exists and copy
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'custom_resume_sections') THEN
        DELETE FROM custom_resume_sections WHERE user_id = target_user_id;
        
        INSERT INTO custom_resume_sections (user_id, title, content, display_order)
        SELECT 
            target_user_id,
            title,
            content,
            display_order
        FROM custom_resume_sections
        WHERE user_id = source_user_id;
        
        RAISE NOTICE 'Custom resume sections copied: % rows', (SELECT COUNT(*) FROM custom_resume_sections WHERE user_id = target_user_id);
    ELSE
        RAISE NOTICE 'Custom resume sections table does not exist - skipping';
    END IF;

    -- ============================================================================
    -- FINAL SUMMARY
    -- ============================================================================
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DATA COPY COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Source: syamimisuhaidi@gmail.com (%)' , source_user_id;
    RAISE NOTICE 'Target: sasuhai@yahoo.com (%)' , target_user_id;
    RAISE NOTICE '';
    RAISE NOTICE 'Copied Data:';
    RAISE NOTICE '- Profile information (excluding username, email, password)';
    RAISE NOTICE '- About features: % rows', (SELECT COUNT(*) FROM about_features WHERE user_id = target_user_id);
    RAISE NOTICE '- Skills: % rows', (SELECT COUNT(*) FROM skills WHERE user_id = target_user_id);
    RAISE NOTICE '- Education: % rows', (SELECT COUNT(*) FROM education WHERE user_id = target_user_id);
    RAISE NOTICE '- Work experience: % rows', (SELECT COUNT(*) FROM work_experience WHERE user_id = target_user_id);
    RAISE NOTICE '- Certifications: % rows', (SELECT COUNT(*) FROM certifications WHERE user_id = target_user_id);
    RAISE NOTICE '- Projects: % rows', (SELECT COUNT(*) FROM projects WHERE user_id = target_user_id);
    RAISE NOTICE '';
    RAISE NOTICE 'Preserved for target user:';
    RAISE NOTICE '- Username: %', target_username;
    RAISE NOTICE '- Email: %', target_email;
    RAISE NOTICE '- Password: [unchanged]';
    RAISE NOTICE '========================================';

END $$;

-- ============================================================================
-- VERIFICATION QUERIES (Run these after the script to verify)
-- ============================================================================

-- Verify profile data
SELECT 
    email,
    username,
    full_name,
    tagline,
    bio,
    location,
    theme_color
FROM profile_info
WHERE email IN ('syamimisuhaidi@gmail.com', 'sasuhai@yahoo.com')
ORDER BY email;

-- Verify about features count
SELECT 
    p.email,
    COUNT(af.id) as features_count
FROM profile_info p
LEFT JOIN about_features af ON p.user_id = af.user_id
WHERE p.email IN ('syamimisuhaidi@gmail.com', 'sasuhai@yahoo.com')
GROUP BY p.email
ORDER BY p.email;

-- Verify skills count
SELECT 
    p.email,
    COUNT(s.id) as skills_count
FROM profile_info p
LEFT JOIN skills s ON p.user_id = s.user_id
WHERE p.email IN ('syamimisuhaidi@gmail.com', 'sasuhai@yahoo.com')
GROUP BY p.email
ORDER BY p.email;

-- Verify education count
SELECT 
    p.email,
    COUNT(e.id) as education_count
FROM profile_info p
LEFT JOIN education e ON p.user_id = e.user_id
WHERE p.email IN ('syamimisuhaidi@gmail.com', 'sasuhai@yahoo.com')
GROUP BY p.email
ORDER BY p.email;

-- Verify work experience count
SELECT 
    p.email,
    COUNT(w.id) as experience_count
FROM profile_info p
LEFT JOIN work_experience w ON p.user_id = w.user_id
WHERE p.email IN ('syamimisuhaidi@gmail.com', 'sasuhai@yahoo.com')
GROUP BY p.email
ORDER BY p.email;

-- Verify certifications count
SELECT 
    p.email,
    COUNT(c.id) as certifications_count
FROM profile_info p
LEFT JOIN certifications c ON p.user_id = c.user_id
WHERE p.email IN ('syamimisuhaidi@gmail.com', 'sasuhai@yahoo.com')
GROUP BY p.email
ORDER BY p.email;

-- Verify projects count
SELECT 
    p.email,
    COUNT(pr.id) as projects_count
FROM profile_info p
LEFT JOIN projects pr ON p.user_id = pr.user_id
WHERE p.email IN ('syamimisuhaidi@gmail.com', 'sasuhai@yahoo.com')
GROUP BY p.email
ORDER BY p.email;
