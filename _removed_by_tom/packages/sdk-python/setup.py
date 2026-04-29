from setuptools import setup, find_packages

setup(
    name="cortexo",
    version="1.0.0",
    description="Cortexo Python SDK — Error tracking for Django, Flask, and Python applications",
    packages=find_packages(),
    python_requires=">=3.7",
    install_requires=[],
    classifiers=[
        "Programming Language :: Python :: 3",
        "Framework :: Django",
        "Framework :: Flask",
        "License :: OSI Approved :: MIT License",
    ],
)
