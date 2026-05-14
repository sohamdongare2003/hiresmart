_ALIAS_MAP = {
    "javascript":   ["js", "javascript", "java script"],
    "typescript":   ["ts", "typescript"],
    "python":       ["python", "py"],
    "node.js":      ["node", "nodejs", "node.js"],
    "react":        ["react", "reactjs", "react.js"],
    "vue.js":       ["vue", "vuejs", "vue.js"],
    "angular":      ["angular", "angularjs"],
    "next.js":      ["next", "nextjs", "next.js"],
    "django":       ["django"],
    "flask":        ["flask"],
    "fastapi":      ["fastapi"],
    "mysql":        ["mysql"],
    "postgresql":   ["postgres", "postgresql"],
    "mongodb":      ["mongo", "mongodb"],
    "docker":       ["docker"],
    "kubernetes":   ["k8s", "kubernetes"],
    "aws":          ["aws", "amazon web services"],
    "git":          ["git", "github", "gitlab"],
    "machine learning": ["ml", "machine learning"],
    "c++":          ["c++", "cpp"],
    "c#":           ["c#", "csharp"],
    "java":         ["java"],
    "go":           ["go", "golang"],
    "rest api":     ["rest", "rest api", "restful"],
    "linux":        ["linux", "unix"],
    "devops":       ["devops"],
    "ci/cd":        ["ci/cd", "cicd"],
}

_REVERSE: dict = {}
for canonical, aliases in _ALIAS_MAP.items():
    for alias in aliases:
        _REVERSE[alias.lower()] = canonical


def normalize(skill: str) -> str:
    return _REVERSE.get(skill.strip().lower(), skill.strip().lower())


def normalize_list(skills: list) -> list:
    seen = set()
    result = []
    for s in skills:
        n = normalize(s)
        if n and n not in seen:
            seen.add(n)
            result.append(n)
    return result