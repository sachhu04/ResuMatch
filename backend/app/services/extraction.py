import re
from typing import Dict, List

class SectionExtractor:
    # Common resume section headers
    SECTION_HEADERS = {
        "summary": [r"summary", r"professional summary", r"profile", r"objective", r"about me"],
        "experience": [r"experience", r"work experience", r"employment", r"professional experience", r"employment history", r"work history", r"internships", r"internship", r"leadership", r"positions of responsibility"],
        "education": [r"education", r"academic background", r"academic history", r"educational background"],
        "skills": [r"skills", r"technical skills", r"core competencies", r"technologies", r"it skills"],
        "projects": [r"projects", r"academic projects", r"personal projects", r"software projects", r"key projects"],
        "certifications": [r"certifications", r"licenses", r"awards", r"achievements", r"honors and awards", r"certifications & awards", r"certifications and awards"],
    }

    @classmethod
    def _compile_header_regex(cls) -> re.Pattern:
        """
        Compiles a regex to match common section headers at the start of a line.
        """
        all_headers = []
        for headers in cls.SECTION_HEADERS.values():
            all_headers.extend(headers)
        
        # Match lines that are just the header, maybe with some whitespace or colons
        # E.g., "WORK EXPERIENCE:", "Education", "TECHNICAL SKILLS"
        pattern = r"^(?:[\s\-\*]*)(?P<header>" + "|".join(all_headers) + r")(?:\s*:)?[\s]*$"
        return re.compile(pattern, re.IGNORECASE | re.MULTILINE)

    @classmethod
    def _normalize_header(cls, header: str) -> str:
        header_lower = header.lower().strip()
        for section, variants in cls.SECTION_HEADERS.items():
            for variant in variants:
                # We do a substring match or regex match here
                if re.search(r"\b" + variant + r"\b", header_lower):
                    return section
        return "other"

    @classmethod
    def extract_resume_sections(cls, text: str) -> Dict[str, str]:
        """
        Splits resume text into logical sections based on common headers.
        """
        # Ensure we have a clean string to work with
        text = text.replace('\r\n', '\n')
        
        header_regex = cls._compile_header_regex()
        
        sections = {}
        current_section = "contact_info" # Default first section
        current_content = []

        lines = text.split("\n")
        
        for line in lines:
            match = header_regex.match(line)
            # If the line is short and matches a header or looks like a standalone header
            if match and len(line.split()) <= 4:
                # Save previous section
                if current_content:
                    sections[current_section] = "\n".join(current_content).strip()
                
                raw_header = match.group("header")
                current_section = cls._normalize_header(raw_header)
                current_content = []
            else:
                current_content.append(line)
        
        # Add the last section
        if current_content:
            sections[current_section] = "\n".join(current_content).strip()

        # Combine any duplicate sections
        consolidated = {}
        for k, v in sections.items():
            if k in consolidated:
                consolidated[k] += "\n" + v
            else:
                consolidated[k] = v

        return consolidated

    @classmethod
    def extract_jd_requirements(cls, text: str) -> str:
        """
        For a JD, we usually want to extract everything, but specifically we can
        target requirements/responsibilities if we need to. For now, we return 
        the whole text for holistic analysis, but it can be enhanced.
        """
        return text.strip()
